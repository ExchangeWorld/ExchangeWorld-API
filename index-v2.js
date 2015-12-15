'use strict';

var http = require('http');
var path = require('path');
var express = require('express');

var bodyParser = require('body-parser');
var compression = require('compression');
var helmet = require('helmet');
var morgan = require('morgan');

var sequelize_sync = require(path.resolve(__dirname, './libs/sync'));
var env = require(path.resolve(__dirname, './libs/env'));

var server = express();
var serverContainer;

sequelize_sync
	.then(() => {
		console.log('DB all synced ...');
		console.log('Igniting API server ...');
	})
	.then(() => {
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
		server.options('*', bodyParser.json(bodyParserSetting));

		server.all('*', (req, res, next) => {
			res.header('Access-Control-Allow-Origin', '*');
			res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
			res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
			next();
		});

		/* Token authentications:
		 * If the path is not /api/authenticate, then it needs authentication
		 * If fail, return {"authentication": "fail"}
		 * If success, and then go next()
		 */
		var authenticate = require('./routers/authenticate');
		server.all(/\/api\/(?!authenticate).+/, authenticate.token, (req, res, next) => {
			next();
		});

		server.use('/api/goods/search', require('./routers/goods.search'));
		server.use('/api/goods', require('./routers/goods'));

		server.use('/api/upload', require('./routers/upload'));

		server.use('/api/follow', require('./routers/follow'));
		server.use('/api/user', require('./routers/user'));

		server.use('/api/comment', require('./routers/comment'));
		server.use('/api/star', require('./routers/star'));
		server.use('/api/queue', require('./routers/queue'));

		server.use('/api/exchange', require('./routers/exchange'));
		server.use('/api/notification', require('./routers/notification'));
		server.use('/api/message', require('./routers/message'));
		server.use('/api/chatroom', require('./routers/chatroom'));

		server.use('/api/authenticate', authenticate.router);

		// catch 404 and forward to error handler
		server.use((req, res, next) => {
			var err = new Error('Not Found');
			err.status = 404;
			next(err);
		});

		// 500 error handlers
		// Development error handler: print stacktrace
		server.use((err, req, res, next) => {
			res.status(err.status || 500);
			err.statusCode = 500;
			if (process.env.NODE_ENV !== 'production' && req.xhr) {
				res.send(err);
			} else if (req.xhr) {
				res.send(err.message);
			}

			next(err);
		});

		// Then start webserver if not already running
		serverContainer = http.createServer(server);
		serverContainer.on('error', err => {
			if (err.code === 'EADDRINUSE') {
				console.log('Development server is already started at port ' + 3002);
			} else {
				throw err;
			}
		});

		serverContainer.listen(3002);

		server.setMaxListeners(0);
		serverContainer.setMaxListeners(0);
		process.setMaxListeners(0);
	});
