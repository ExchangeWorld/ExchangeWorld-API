'use strict';

/*
	{
		token: TOKEN
	}
*/

/*
	{
		chatroom_cid: chatroom_cid,
		content: CONTENT
	}
*/

/*
	{
		sender_uid: sender_uid,
		chatroom_cid: chatroom_cid,
		content: CONTENT
	}
*/

var path = require('path');

var redis = require(path.resolve(__dirname, '../libs/redis'));

var messages = require(path.resolve(__dirname, '../ORM/Messages'));
var chatrooms = require(path.resolve(__dirname, '../ORM/Chatrooms'));

var webSocketServerInstance_message = require(path.resolve(__dirname, './main')).webSocketServerInstance_message;

var websocketInitialize = websocket => {
	websocket.exwd_authorized = true;
};

var websocketAuthorize = websocket => {
	var _token = websocket.token;

	if (websocket.exwd_authorized === true) {
		return;
	}

	if (_token === null || _token === '' || _token === undefined) {
		websocket.send(JSON.stringify({
			status: 'bad',
			error: 'token is not provided'
		}), () => {
			websocket.close();
		});
		return;
	}

	redis.get(_token, (err, result) => {
		if (err) {
			websocket.send(JSON.stringify({
				status: 'bad',
				error: err
			}), () => {
				websocket.close();
			});
		} else if (result === null) {
			websocket.send(JSON.stringify({
				status: 'bad',
				error: 'token is bad'
			}), () => {
				websocket.close();
			});
		} else {
			websocket.exwd_authorized = true;
			websocket.exwd_uid = parseInt(result, 10);

			redis.pipeline().set(_token, result).expire(_token, 1200).exec((err, res) => {
				if (err) {
					websocket.send(JSON.stringify({
						status: 'bad',
						error: err
					}));
				} else {
					websocket.send('{status:"good",message:"Let\'s websocket!"}');
				}
			});
		}
	});
};

var websocketOnMessage = websocket => {
	websocket.on('message', buffer => {
		var msg = JSON.parse(buffer.toString());

		if (websocket.exwd_authorized === true) {
			console.log('message open ->', msg);
			console.log('clients:', webSocketServerInstance_message.clients.length);

		} else {
			websocketInitialize(websocket);
			websocketAuthorize(websocket);
		}
	});
};

var websocketOnClose = websocket => {
	websocket.on('close', (code, buffer) => {
		console.log(code, buffer.toString());
	});
};

var handleMessageConnection = websocket => {
	websocketOnMessage(websocket);
	websocketOnClose(websocket);
};

module.exports = handleMessageConnection;
