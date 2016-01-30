'use strict';

var cluster = require('cluster');
var url = require('url');
var cpus = require('os').cpus().length / 2;

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

	var proxy = httpProxy.createProxyServer({
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

	var restfulMappingRule = {};
	restfulMappingRule.GET = [
		[/\/api\/exchange\/([0-9]+)\/?$/, (regex, req) => {
			req.urlObj.query.eid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
			req.urlObj.pathname = '/api/exchange';
		}],
		[/\/api\/follow\/user\/([0-9]+)\/?$/, (regex, req) => '/api/follow'],
		[/\/api\/goods\/([0-9]+)\/?$/, (regex, req) => '/api/goods'],
		[/\/api\/goods\/([0-9]+)\/comment\/?$/, (regex, req) => {
			req.urlObj.query.goods_gid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
			req.urlObj.pathname = '/api/comment/of/goods';
		}],
		[/\/api\/goods\/([0-9]+)\/exchange\/?$/, (regex, req) => '/api/exchange'],
		[/\/api\/goods\/([0-9]+)\/queue\/?$/, (regex, req) => '/api/queue'],
		[/\/api\/goods\/([0-9]+)\/star\/?$/, (regex, req) => '/api/star'],
		[/\/api\/queue\/goods\/([0-9]+)\/?$/, (regex, req) => '/api/queue'],
		[/\/api\/queue\/user\/([0-9]+)\/?$/, (regex, req) => '/api/queue'],
		[/\/api\/star\/user\/([0-9]+)/, (regex, req) => '/api/star'],
		[/\/api\/user\/([0-9]+)\/?$/, (regex, req) => '/api/user'],
		[/\/api\/user\/([0-9]+)\/comment\/?$/, (regex, req) => {
			req.urlObj.query.commenter_uid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
			req.urlObj.pathname = '/api/comment/of/user';
		}],
		[/\/api\/user\/([0-9]+)\/exchange\/?$/, (regex, req) => '/api/exchange'],
		[/\/api\/user\/([0-9]+)\/follow\/?$/, (regex, req) => '/api/follow'],
		[/\/api\/user\/([0-9]+)\/goods\/?$/, (regex, req) => '/api/goods'],
		[/\/api\/user\/([0-9]+)\/queue\/?$/, (regex, req) => '/api/queue'],
		[/\/api\/user\/([0-9]+)\/star\/?$/, (regex, req) => '/api/star']
	];

	restfulMappingRule.POST = [
		[/\/api\/comment\/?$/, (regex, req) => {
			req.urlObj.pathname = '/api/comment/post';
		}],
		[/\/api\/exchange\/?$/, (regex, req) => '/api/exchange'],
		[/\/api\/follow\/?$/, (regex, req) => '/api/follow'],
		[/\/api\/goods\/?$/, (regex, req) => '/api/goods'],
		[/\/api\/queue\/?$/, (regex, req) => '/api/queue'],
		[/\/api\/star\/?$/, (regex, req) => '/api/star'],
		[/\/api\/user\/?$/, (regex, req) => '/api/user']
	];

	restfulMappingRule.PUT = [
		[/\/api\/comment\/([0-9]+)\/?$/, (regex, req) => {
			req.urlObj.query.cid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
			req.urlObj.pathname = '/api/comment/edit';
		}],
		[/\/api\/exchange\/([0-9]+)\/?$/, (regex, req) => '/api/exchange'],
		[/\/api\/follow\/([0-9]+)\/?$/, (regex, req) => '/api/follow'],
		[/\/api\/goods\/([0-9]+)\/?$/, (regex, req) => '/api/goods'],
		[/\/api\/queue\/([0-9]+)\/?$/, (regex, req) => '/api/queue'],
		[/\/api\/star\/([0-9]+)\/?$/, (regex, req) => '/api/star'],
		[/\/api\/user\/([0-9]+)\/?$/, (regex, req) => '/api/user']
	];

	restfulMappingRule.DELETE = [
		[/\/api\/comment\/([0-9]+)\/?$/, (regex, req) => {
			req.urlObj.query.cid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
			req.urlObj.pathname = '/api/comment/delete';
		}],
		[/\/api\/exchange\/([0-9]+)\/?$/, (regex, req) => '/api/exchange'],
		[/\/api\/follow\/([0-9]+)\/?$/, (regex, req) => '/api/follow'],
		[/\/api\/goods\/([0-9]+)\/?$/, (regex, req) => '/api/goods'],
		[/\/api\/queue\/([0-9]+)\/?$/, (regex, req) => '/api/queue'],
		[/\/api\/star\/([0-9]+)\/?$/, (regex, req) => '/api/star'],
		[/\/api\/user\/([0-9]+)\/?$/, (regex, req) => '/api/user']
	];

	var resfulMapping = (req, res, callback) => {
		var pathname = req.urlObj.pathname;
		var patterns = restfulMappingRule[req.method];
		var length = patterns.length;
		for (var i = 0; i < length; i++) {
			if (patterns[i][0].test(pathname)) {
				patterns[i][1](patterns[i][0], req);
				break;
			}
		}
		callback(null, req, res);
	};

	var proxyBalancer = http.createServer((req, res) => {
		async.waterfall([
			async.apply(urlParsing, req, res),
			resfulMapping
		], (err, req, res) => {
			proxy.web(req, res, {
				target: url.format(req.urlObj),
				prependPath: true,
				ignorePath: true
			});
		});
	});

	proxy.setMaxListeners(0);
	proxyBalancer.setMaxListeners(0);

	proxyBalancer.listen(3002);

	// EXPRESS TEST
	var express = require('express');

	var bodyParser = require('body-parser');
	var compression = require('compression');
	var helmet = require('helmet');
	var morgan = require('morgan');
	var server = express();
	// Protect server from some well-known web vulnerabilities
	server.use(helmet());

	// Compress req before all middlewares
	server.use(compression());

	// Log all requests to the console
	server.use(morgan('dev'));

	// Setting for bodyparser
	var bodyParserSetting = {
		limit: '64mb',
		extended: true
	};

	// For parsing application/json
	server.post('*', bodyParser.json(bodyParserSetting));
	server.put('*', bodyParser.json(bodyParserSetting));
	server.options('*', bodyParser.json(bodyParserSetting));

	// For parsing application/x-www-form-urlencoded
	server.post('*', bodyParser.urlencoded(bodyParserSetting));
	server.put('*', bodyParser.urlencoded(bodyParserSetting));
	server.options('*', bodyParser.urlencoded(bodyParserSetting));

	server.all('*', (req, res, next) => {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
		res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
		next();
	});

	server.all('*', (req, res) => {
		res.json({
			query: req.query,
			body: req.body
		});
	});

	var serverContainer = http.createServer(server);
	serverContainer.on('error', err => {
		if (err.code === 'EADDRINUSE') {
			console.log('Development server is already started at port ' + 3003);
		} else {
			throw err;
		}
	});

	serverContainer.listen(3003);

	server.setMaxListeners(0);
	serverContainer.setMaxListeners(0);
}
