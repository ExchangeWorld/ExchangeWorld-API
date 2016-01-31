'use strict';
const cluster_port = 3002;
const tester_port = 4003;

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

		[/\/api\/follow\/user\/([0-9]+)\/?$/, (regex, req) => {
			req.urlObj.query.followed_uid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
			req.urlObj.pathname = '/api/follow/followers/of';
		}],

		[/\/api\/goods\/?$/, (regex, req) => {
			req.urlObj.pathname = '/api/goods/search';
		}],
		[/\/api\/goods\/([0-9]+)\/?$/, (regex, req) => {
			req.urlObj.query.gid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
			req.urlObj.pathname = '/api/goods';
		}],
		[/\/api\/goods\/([0-9]+)\/comment\/?$/, (regex, req) => {
			req.urlObj.query.goods_gid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
			req.urlObj.pathname = '/api/comment/of/goods';
		}],
		[/\/api\/goods\/([0-9]+)\/queue\/?$/, (regex, req) => {
			req.urlObj.query.host_goods_gid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
			req.urlObj.pathname = '/api/queue/of/goods';
		}],
		[/\/api\/goods\/([0-9]+)\/star\/?$/, (regex, req) => {
			req.urlObj.query.goods_gid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
			req.urlObj.pathname = '/api/star/to';
		}],

		[/\/api\/queue\/goods\/([0-9]+)\/?$/, (regex, req) => {
			req.urlObj.query.queuer_goods_gid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
			req.urlObj.pathname = '/api/queue/by/goods';
		}],
		[/\/api\/queue\/user\/([0-9]+)\/?$/, (regex, req) => {
			req.urlObj.query.queuer_user_uid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
			req.urlObj.pathname = '/api/queue/by/person';
		}],

		[/\/api\/user\/([0-9]+)\/?$/, (regex, req) => {
			req.urlObj.query.uid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
			req.urlObj.pathname = '/api/user';
		}],
		[/\/api\/user\/([0-9]+)\/comment\/?$/, (regex, req) => {
			req.urlObj.query.commenter_uid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
			req.urlObj.pathname = '/api/comment/of/user';
		}],
		[/\/api\/user\/([0-9]+)\/exchange\/?$/, (regex, req) => {
			req.urlObj.query.owner_uid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
			req.urlObj.pathname = '/api/exchange/of/user/all';
		}],
		[/\/api\/user\/([0-9]+)\/exchange\/([0-9]+)\/?$/, (regex, req) => {
			var tmp = regex.exec(req.urlObj.pathname);
			req.urlObj.query.owner_uid = parseInt(tmp[1], 10);
			req.urlObj.query.eid = parseInt(tmp[2], 10);
			req.urlObj.pathname = '/api/exchange/of/user/one';
		}],
		[/\/api\/user\/([0-9]+)\/follow\/?$/, (regex, req) => {
			req.urlObj.query.follower_uid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
			req.urlObj.pathname = '/api/follow/followed/by';
		}],
		[/\/api\/user\/([0-9]+)\/goods\/?$/, (regex, req) => {
			req.urlObj.query.owner_uid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
			req.urlObj.pathname = '/api/goods/of';
		}],
		[/\/api\/user\/([0-9]+)\/goods\/([0-9]+)\/?$/, (regex, req) => {
			req.urlObj.query.gid = parseInt(regex.exec(req.urlObj.pathname)[2], 10);
			req.urlObj.pathname = '/api/goods';
		}],
		[/\/api\/user\/([0-9]+)\/queue\/?$/, (regex, req) => {
			req.urlObj.query.host_user_uid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
			req.urlObj.pathname = '/api/queue/of/person';
		}],
		[/\/api\/user\/([0-9]+)\/star\/?$/, (regex, req) => {
			req.urlObj.query.starring_user_uid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
			req.urlObj.pathname = '/api/star/by';
		}]
	];

	restfulMappingRule.POST = [
		[/\/api\/comment\/?$/, (regex, req) => {
			req.urlObj.pathname = '/api/comment/post';
		}],
		[/\/api\/exchange\/?$/, (regex, req) => {
			req.urlObj.pathname = '/api/exchange/create';
		}],
		[/\/api\/follow\/?$/, (regex, req) => {
			req.urlObj.pathname = '/api/follow/post';
		}],
		[/\/api\/goods\/?$/, (regex, req) => {
			req.urlObj.pathname = '/api/goods/post';
		}],
		[/\/api\/queue\/?$/, (regex, req) => {
			req.urlObj.pathname = '/api/queue/post';
		}],
		[/\/api\/star\/?$/, (regex, req) => {
			req.urlObj.pathname = '/api/star/post';
		}],
		[/\/api\/user\/?$/, (regex, req) => {
			req.urlObj.pathname = '/api/authenticate/register';
		}]
	];

	restfulMappingRule.PUT = [
		[/\/api\/comment\/([0-9]+)\/?$/, (regex, req) => {
			req.urlObj.query.cid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
			req.urlObj.pathname = '/api/comment/edit';
		}],
		[/\/api\/exchange\/([0-9]+)\/drop\/?$/, (regex, req) => {
			req.urlObj.query.eid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
			req.urlObj.pathname = '/api/exchange/drop';
		}],
		[/\/api\/exchange\/([0-9]+)\/agree\/?$/, (regex, req) => {
			req.urlObj.query.eid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
			req.urlObj.pathname = '/api/exchange/agree';
		}],
		[/\/api\/goods\/([0-9]+)\/?$/, (regex, req) => {
			req.urlObj.query.gid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
			req.urlObj.pathname = '/api/goods/edit';
		}],
		[/\/api\/goods\/([0-9]+)\/rate\/?$/, (regex, req) => {
			req.urlObj.query.gid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
			req.urlObj.pathname = '/api/goods/rate';
		}],
		[/\/api\/user\/([0-9]+)\/?$/, (regex, req) => {
			req.urlObj.query.uid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
			req.urlObj.pathname = '/api/user/edit';
		}],
		[/\/api\/user\/([0-9]+)\/photo\/?$/, (regex, req) => {
			req.urlObj.query.uid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
			req.urlObj.pathname = '/api/user/photo';
		}]
	];

	restfulMappingRule.DELETE = [
		[/\/api\/comment\/([0-9]+)\/?$/, (regex, req) => {
			req.urlObj.query.cid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
			req.urlObj.pathname = '/api/comment/delete';
		}],
		[/\/api\/exchange\/([0-9]+)\/?$/, (regex, req) => {
			req.urlObj.query.eid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
			req.urlObj.pathname = '/api/exchange/drop';
		}],
		[/\/api\/follow\/([0-9]+)\/to\/([0-9]+)\/?$/, (regex, req) => {
			req.urlObj.query.follower_uid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
			req.urlObj.query.followed_uid = parseInt(regex.exec(req.urlObj.pathname)[2], 10);
			req.urlObj.pathname = '/api/follow/delete';
		}],
		[/\/api\/goods\/([0-9]+)\/?$/, (regex, req) => {
			req.urlObj.query.gid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
			req.urlObj.pathname = '/api/goods/delete';
		}],
		[/\/api\/queue\/([0-9]+)\/to\/([0-9]+)\/?$/, (regex, req) => {
			var tmp = regex.exec(req.urlObj.pathname);
			req.urlObj.query.queuer_goods_gid = parseInt(tmp[1], 10);
			req.urlObj.query.host_goods_gid = parseInt(tmp[2], 10);
			req.urlObj.pathname = '/api/queue/delete';
		}],
		[/\/api\/star\/([0-9]+)\/to\/([0-9]+)\/?$/, (regex, req) => {
			var tmp = regex.exec(req.urlObj.pathname);
			req.urlObj.query.starring_user_uid = parseInt(tmp[1], 10);
			req.urlObj.query.goods_gid = parseInt(tmp[2], 10);
			req.urlObj.pathname = '/api/star/delete';
		}]
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

	var proxyBalancer = http.createServer((req, res) => {
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
	proxyBalancer.setMaxListeners(0);

	proxyBalancer.listen(cluster_port);

	// EXPRESS TEST
	if (env.NODE_ENV === 'development') {
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
				console.log('Development server is already started at port ' + tester_port);
			} else {
				throw err;
			}
		});

		serverContainer.listen(tester_port);

		server.setMaxListeners(0);
		serverContainer.setMaxListeners(0);
	}
}
