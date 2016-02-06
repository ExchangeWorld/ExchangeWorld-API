'use strict';

const websocket_port = 3080;

var http = require('http');
var websocket = require('websocket');

var server = http.createServer((req, res) => {
	res.end('this is exwd websocket server');
});

var WebSocketServer = websocket.Server;
var wss = new WebSocketServer({
	server: server,
	clientTracking: true
});

var sockets = [];

wss.on('connection', ws => {

	ws.on('message', message => {
		console.log(message.toString(), ws.upgradeReq.headers);
		ws.send('hello dear');
	});

	ws.on('close', (code, msg) => {
		console.log(code, msg.toString(), ws.upgradeReq.headers);
	});
});

server.listen(websocket_port);
