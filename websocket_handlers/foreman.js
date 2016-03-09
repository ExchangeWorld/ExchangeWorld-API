'use strict';

var http = require('http');
var path = require('path');

var websocket = require('ws');

var webSocketServerContainer = http.createServer((req, res) => {
	res.end('4o4');
});

var webSocketServerClass = websocket.Server;
var webSocketServerOption = {
	general: {
		server: webSocketServerContainer,
		clientTracking: true,
		path: '/'
	}
};

var webSocketServerInstance = new webSocketServerClass(webSocketServerOption.general);

module.exports = {
	webSocketServerContainer: webSocketServerContainer,
	webSocketServerInstance: webSocketServerInstance
};

var general_Handler = require(path.resolve(__dirname, './message_notification'));

webSocketServerInstance.on('connection', general_Handler);
webSocketServerInstance.setMaxListeners(0);

webSocketServerContainer.setMaxListeners(0);
