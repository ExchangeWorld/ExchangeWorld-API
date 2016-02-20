'use strict';

var http = require('http');
var path = require('path');

var websocket = require('ws');

var webSocketServerContainer = http.createServer((req, res) => {
	res.end('4o4');
});

var webSocketServerClass = websocket.Server;
var webSocketServerOption = {
	message: {
		server: webSocketServerContainer,
		clientTracking: true,
		path: '/message'
	},
	notification: {
		server: webSocketServerContainer,
		clientTracking: true,
		path: '/notification'
	}
};


var webSocketServerInstance_message = new webSocketServerClass(webSocketServerOption.message);
// var webSocketServerInstance_notification = new webSocketServerClass(webSocketServerOption.notification);

module.exports = {
	webSocketServerContainer: webSocketServerContainer,
	webSocketServerInstance_message: webSocketServerInstance_message
};

var messageHandler = require(path.resolve(__dirname, './message'));

webSocketServerInstance_message.on('connection', messageHandler);
// webSocketServerInstance_notification.on('connection');

webSocketServerInstance_message.setMaxListeners(0);
// webSocketServerInstance_notification.setMaxListeners(0);

webSocketServerContainer.setMaxListeners(0);
