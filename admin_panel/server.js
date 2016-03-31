'use strict';

const cluster_port = 666;

var http = require('http');
var path = require('path');

var express = require('express');

var bodyParser = require('body-parser');
var compression = require('compression');
var helmet = require('helmet');
var morgan = require('morgan');

var sequelize_sync = require(path.resolve(__dirname, '../libs/sync'));
var env = require(path.resolve(__dirname, '../libs/env'));

var server = express();
var serverContainer;

var routers = {
	user: require(path.resolve(__dirname, './routers/user.js')),
	goods: require(path.resolve(__dirname, './routers/goods.js')),
	exchange: require(path.resolve(__dirname, './routers/exchange.js'))
};

var authenticate = require(path.resolve(__dirname, './libs/authenticate.js'));

sequelize_sync
	.then(() => {
		console.log('DB all synced ...');
		console.log('Igniting API server ...');
	})
	.then(() => {
		console.log('Loading admin list ...');
		return authenticate.loadingAdminList;
	})
	.then(adminList => {
		console.log(adminList);
		console.log('Loading admin list done');

		// Protect server from some well-known web vulnerabilities
		server.use(helmet());

		// Compress req before all middlewares
		server.use(compression());

		// Log all requests to the console
		server.use(morgan(env.NODE_ENV === 'production' ? 'short' : 'dev'));

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

		server.all('*', authenticate.tokenCheck, (req, res, next) => {
			if (adminList.indexOf(req.exwd.uid) === -1) {
				res.status(403).json({
					error: 'forbidden'
				});
			} else {
				next();
			}
		});

		server.use('/api/admin/user', routers.user);

		// catch 404 and forward to error handler
		server.use((req, res, next) => {
			var err = new Error('Not Found');
			err.status = 404;
			next(err);
		});

		// 500 error handlers
		// Development error handler: print stacktrace
		server.use((err, req, res) => {
			res.status(err.status || 500);
			err.statusCode = 500;
			if (env.NODE_ENV !== 'production' && req.xhr) {
				res.send(err);
			} else if (req.xhr) {
				res.send(err.message);
			}
		});

		// Then start webserver if not already running
		serverContainer = http.createServer(server);
		serverContainer.on('error', err => {
			if (err.code === 'EADDRINUSE') {
				console.log('Development server is already started at port ' + cluster_port);
			} else {
				throw err;
			}
		});

		serverContainer.listen(cluster_port);

		server.setMaxListeners(0);
		serverContainer.setMaxListeners(0);

		console.log('Server igniting done');
	})
	.catch(err => console.log(err));
