'use strict';

const websocket_port = 3080;

var http = require('http');
var cluster = require('cluster');
var cpus = require('os').cpus().length;

var websocket = require('ws');

cluster.setMaxListeners(0);
process.setMaxListeners(0);

if (cluster.isMaster) {
	for (var i = 0; i < cpus; i++) {
		cluster.fork();
	}

	cluster.on('exit', (worker, code, signal) => {
		console.log('websocket-container worker %d died (%s). restarting...', worker.process.pid, signal || code);
		cluster.fork();
	});
} else {
	var webSocketServerContainer = http.createServer((req, res) => {
		res.end('this is exwd websocket server');
	});

	var webSocketServerClass = websocket.Server;
	var webSocketServerInstance = new webSocketServerClass({
		server: webSocketServerContainer,
		clientTracking: true
	});

	var sockets = [];

	webSocketServerInstance.on('connection', websocket => {

		websocket.on('message', message => {
			console.log(message.toString(), websocket.upgradeReq.headers);
			websocket.send('hello dear');
		});

		websocket.on('close', (code, msg) => {
			console.log(code, msg.toString(), websocket.upgradeReq.headers);
		});
	});

	webSocketServerContainer.setMaxListeners(0);
	webSocketServerInstance.setMaxListeners(0);

	webSocketServerContainer.listen(websocket_port);
}
