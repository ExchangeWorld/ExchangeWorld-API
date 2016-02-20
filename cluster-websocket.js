'use strict';

const websocket_port = 3080;

var path = require('path');

var sequelize_sync = require(path.resolve(__dirname, './libs/sync'));
var websocketHandlers = require(path.resolve(__dirname, './websocket_handlers/foreman'));

sequelize_sync
	.then(() => {
		console.log('DB all synced ...');
		console.log('Igniting API server ...');
	})
	.then(() => {
		var webSocketServerContainer = websocketHandlers.webSocketServerContainer;
		webSocketServerContainer.listen(websocket_port);
	});
