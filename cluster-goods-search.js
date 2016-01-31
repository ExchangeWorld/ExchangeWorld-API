'use strict';
const cluster_port = 3005;

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

	var compression = require('compression');
	var helmet = require('helmet');
	var morgan = require('morgan');

	var sequelize_sync = require(path.resolve(__dirname, './libs/sync'));
	var env = require(path.resolve(__dirname, './libs/env'));

	var server = express();
	var serverContainer;

	var routers = {
		search: require(path.resolve(__dirname, './routers/goods.search'))
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

			server.all('*', (req, res, next) => {
				res.header('Access-Control-Allow-Origin', '*');
				res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
				res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
				next();
			});

			server.use('/api/goods/search', routers.search);

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
