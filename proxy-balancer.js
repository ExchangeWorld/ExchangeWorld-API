'use strict';

const cluster_port = 3002;
const websocket_port = 3080;

var cluster = require('cluster');
var path = require('path');
var url = require('url');
var cpus = require('os').cpus().length;

cluster.setMaxListeners(0);
process.setMaxListeners(0);

if (cluster.isMaster) {
	for (var i = 0; i < cpus; i++) {
		cluster.fork();
	}

	cluster.on('exit', (worker, code, signal) => {
		console.log('proxy-balancer worker %d died (%s). restarting...', worker.process.pid, signal || code);
		cluster.fork();
	});
} else {
	var http = require('http');
	var httpProxy = require('http-proxy');
	var async = require('async');
	var env = require(path.resolve(__dirname, './libs/env'));

	var restfulMappingRule = require(path.resolve(__dirname, './libs/restfulMappingRule'));

	var proxy = httpProxy.createProxyServer();
	var proxyWebSocket = new httpProxy.createProxyServer({
		target: {
			host: 'localhost',
			port: websocket_port
		},
		ws: true
	});

	proxy.on('error', (err, req, res) => {
		res.writeHead(500, {
			'Content-Type': 'text/plain'
		});
		res.end('ERROR');
	});

	var urlParsing = (req, res, callback) => {
		req.urlObj = url.parse(req.url, true);
		req.urlObj.protocol = 'http:';
		req.urlObj.slashes = true;
		req.urlObj.host = 'localhost:3003';
		req.urlObj.search = '';
		callback(null, req, res);
	};

	var resfulMapping = (req, res, callback) => {
		var pathname = req.urlObj.pathname;
		var patterns = restfulMappingRule[req.method];
		var length = (patterns === undefined ? 0 : patterns.length);
		for (var i = 0; i < length; i++) {
			if (patterns[i][0].test(pathname)) {
				patterns[i][1](patterns[i][0], req);
				break;
			}
		}
		callback(null, req, res);
	};

	var routeCluster = (req, res, callback) => {
		var _url = req.urlObj.pathname;

		if (/\/api\/goods\/search\/?$/.test(_url)) {
			req.urlObj.host = 'localhost:3005';
		} else if (/\/api\/goods\/?/.test(_url)) {
			req.urlObj.host = 'localhost:3004';
		} else if (/\/api\/user\/?/.test(_url)) {
			req.urlObj.host = 'localhost:3006';
		} else if (/\/api\/authenticate\/?/.test(_url)) {
			req.urlObj.host = 'localhost:3006';
		} else if (/\/api\/upload\/?/.test(_url)) {
			req.urlObj.host = 'localhost:3007';
		} else {
			req.urlObj.host = 'localhost:3003';
		}

		callback(null, req, res);
	};

	var proxyHttpBalancer = http.createServer((req, res) => {
		async.waterfall([
			async.apply(urlParsing, req, res),
			resfulMapping,
			routeCluster
		], (err, req, res) => {
			proxy.web(req, res, {
				target: url.format(req.urlObj),
				prependPath: true,
				ignorePath: true
			});
		});
	});

	proxy.setMaxListeners(0);
	proxyWebSocket.setMaxListeners(0);
	proxyHttpBalancer.setMaxListeners(0);

	proxyHttpBalancer.on('upgrade', (req, socket, head) => {
		proxyWebSocket.ws(req, socket, head);
	});

	proxyHttpBalancer.listen(cluster_port);

	// EXPRESS TEST
	// if (env.NODE_ENV === 'development') {
	// 	var express = require('express');
	//
	// 	var bodyParser = require('body-parser');
	// 	var compression = require('compression');
	// 	var helmet = require('helmet');
	// 	var morgan = require('morgan');
	// 	var server = express();
	// 	// Protect server from some well-known web vulnerabilities
	// 	server.use(helmet());
	//
	// 	// Compress req before all middlewares
	// 	server.use(compression());
	//
	// 	// Log all requests to the console
	// 	server.use(morgan('dev'));
	//
	// 	// Setting for bodyparser
	// 	var bodyParserSetting = {
	// 		limit: '64mb',
	// 		extended: true
	// 	};
	//
	// 	// For parsing application/json
	// 	server.post('*', bodyParser.json(bodyParserSetting));
	// 	server.put('*', bodyParser.json(bodyParserSetting));
	// 	server.options('*', bodyParser.json(bodyParserSetting));
	//
	// 	// For parsing application/x-www-form-urlencoded
	// 	server.post('*', bodyParser.urlencoded(bodyParserSetting));
	// 	server.put('*', bodyParser.urlencoded(bodyParserSetting));
	// 	server.options('*', bodyParser.urlencoded(bodyParserSetting));
	//
	// 	server.all('*', (req, res, next) => {
	// 		res.header('Access-Control-Allow-Origin', '*');
	// 		res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
	// 		res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	// 		next();
	// 	});
	//
	// 	server.all('*', (req, res) => {
	// 		res.json({
	// 			query: req.query,
	// 			body: req.body
	// 		});
	// 	});
	//
	// 	var serverContainer = http.createServer(server);
	// 	serverContainer.on('error', err => {
	// 		if (err.code === 'EADDRINUSE') {
	// 			console.log('Development server is already started');
	// 		} else {
	// 			throw err;
	// 		}
	// 	});
	//
	// 	serverContainer.listen(3003);
	// 	serverContainer.listen(3004);
	// 	serverContainer.listen(3005);
	// 	serverContainer.listen(3006);
	// 	serverContainer.listen(3007);
	//
	// 	server.setMaxListeners(0);
	// 	serverContainer.setMaxListeners(0);
	// }
}
