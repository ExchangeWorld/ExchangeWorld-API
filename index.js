'use strict';

var http = require('http');
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var compression = require('compression');

var sequelize_sync = require('./libs/sync');
sequelize_sync
	.then(() => {
		console.log('DB all synced ...');
		console.log('Igniting API server ...');
	})
	.then(() => {
		var server = express();

		// log all requests to the console
		if (process.env.NODE_ENV !== 'production') {
			server.use(morgan('dev'));
		}

		// for parsing application/json
		server.use(bodyParser.json({
			limit: '64mb'
		}));

		// for parsing application/x-www-form-urlencoded
		server.use(bodyParser.urlencoded({
			limit: '64mb',
			extended: true
		}));

		server.use(cookieParser());
		server.use(compression());

		server.disable('x-powered-by');

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

		server.use('/api/user/profile/follower', require('./routers/follower'));
		server.use('/api/user/profile/following', require('./routers/following'));
		server.use('/api/user/profile', require('./routers/user.profile'));
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
		var s = http.createServer(server);
		s.on('error', err => {
			if (err.code === 'EADDRINUSE') {
				console.log('Development server is already started at port ' + 3000);
			} else {
				throw err;
			}
		});

		s.listen(3000);
	});
