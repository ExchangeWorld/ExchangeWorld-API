'use strict';
const cluster_port = 3003;

var cluster = require('cluster');
var cpus = require('os').cpus().length;

cluster.setMaxListeners(0);

var http = require('http');
var path = require('path');

if (cluster.isMaster) {
	for (var i = 0; i < cpus; i++) {
		cluster.fork();
	}

	cluster.on('exit', (worker, code, signal) => {
		console.log('exwd-api-v2 worker %d died (%s). restarting...',
			worker.process.pid, signal || code);
		cluster.fork();
	});
} else {
	var express = require('express');

	var bodyParser = require('body-parser');
	var compression = require('compression');
	var helmet = require('helmet');
	var morgan = require('morgan');

	var sequelize_sync = require(path.resolve(__dirname, './libs/sync'));
	var env = require(path.resolve(__dirname, './libs/env'));

	var server = express();
	var serverContainer;

	var routers = {
		authenticate: require(path.resolve(__dirname, './routers/authenticate')),
		follow: require(path.resolve(__dirname, './routers/follow')),
		chatroom: require(path.resolve(__dirname, './routers/chatroom')),
		comment: require(path.resolve(__dirname, './routers/comment')),
		message: require(path.resolve(__dirname, './routers/message')),
		star: require(path.resolve(__dirname, './routers/star')),
		queue: require(path.resolve(__dirname, './routers/queue')),
		exchange: require(path.resolve(__dirname, './routers/exchange')),
		notification: require(path.resolve(__dirname, './routers/notification'))
	};

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
			server.options('*', bodyParser.urlencoded(bodyParserSetting));

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
			server.all(/\/api\/(?!authenticate).+/, routers.authenticate.token, (req, res, next) => {
				next();
			});

			server.use('/api/follow', routers.follow);

			server.use('/api/message', routers.message);
			server.use('/api/chatroom', routers.chatroom);

			server.use('/api/comment', routers.comment);

			server.use('/api/star', routers.star);

			server.use('/api/queue', routers.queue);

			server.use('/api/exchange', routers.exchange);
			server.use('/api/notification', routers.notification);

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
				if (env.NODE_ENV !== 'production' && req.xhr) {
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
					console.log('Development server is already started at port ' + cluster_port);
				} else {
					throw err;
				}
			});

			serverContainer.listen(cluster_port);

			server.setMaxListeners(0);
			serverContainer.setMaxListeners(0);
			process.setMaxListeners(0);
		});
}
