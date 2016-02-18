'use strict';

const websocket_port = 3080;

var path = require('path');
// var cluster = require('cluster');
// var cpus = require('os').cpus().length;

// cluster.setMaxListeners(0);
// process.setMaxListeners(0);

// if (cluster.isMaster) {
// 	for (var i = 0; i < cpus; i++) {
// 		cluster.fork();
// 	}
//
// 	cluster.on('exit', (worker, code, signal) => {
// 		console.log('websocket-container worker %d died (%s). restarting...', worker.process.pid, signal || code);
// 		cluster.fork();
// 	});
// } else {
var sequelize_sync = require(path.resolve(__dirname, './libs/sync'));
var websocketHandlers = require(path.resolve(__dirname, './websocket_handlers/main'));

sequelize_sync
	.then(() => {
		console.log('DB all synced ...');
		console.log('Igniting API server ...');
	})
	.then(() => {
		var webSocketServerContainer = websocketHandlers.webSocketServerContainer;
		webSocketServerContainer.listen(websocket_port);
	});
// }
