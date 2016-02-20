'use strict';

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
// var querystring = require('querystring');
var url = require('url');

var redis = require(path.resolve(__dirname, '../libs/redis'));

var messages = require(path.resolve(__dirname, '../ORM/Messages'));
var chatrooms = require(path.resolve(__dirname, '../ORM/Chatrooms'));

var indexOf = (arr, item) => {
	if (item === undefined || item === null) {
		return -1;
	}

	var length = arr.length;
	var answer = -1;

	for (var i = 0; i < length; i++) {
		if (item.upgradeReq.headers['sec-websocket-key'] === arr[i].upgradeReq.headers['sec-websocket-key']) {
			answer = i;
			break;
		}
	}
	return answer;
};

var webSocketServerInstance_message = require(path.resolve(__dirname, './foreman')).webSocketServerInstance_message;

var websocketClientsInIndex = {};

var websocketInitialize = websocket => {
	websocket.exwd_authorized = false;
	var tmpQuery = url.parse(websocket.upgradeReq.url, true).query;
	websocket.exwd_token = tmpQuery.token;
};

var websocketAuthorize = (websocket, callbacks) => {
	var _token = websocket.exwd_token;

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

			redis.pipeline().set(_token, result).expire(_token, 12000).exec((err, res) => {
				if (err) {
					websocket.send(JSON.stringify({
						status: 'bad',
						error: err
					}));
				} else {
					// websocket.send('{status:"good",message:"Let\'s websocket!"}');
					callbacks.forEach(cbf => cbf(websocket));
				}
			});
		}
	});
};

var websocketAddSession = websocket => {
	var uid = websocket.exwd_uid;

	if (uid in websocketClientsInIndex) {
		websocketClientsInIndex[uid].push(indexOf(webSocketServerInstance_message.clients, websocket));
	} else {
		websocketClientsInIndex[uid] = [indexOf(webSocketServerInstance_message.clients, websocket)];
	}
};

var websocketDelSession = websocket => {
	var uid = websocket.exwd_uid;
	var tmpIndex = indexOf(webSocketServerInstance_message.clients, websocket);

	if (uid in websocketClientsInIndex) {
		websocketClientsInIndex[uid].splice(tmpIndex, 1);
	}
};

var websocketClientPushMessage = (websocket, msg) => {
	msg.sender_uid = websocket.exwd_uid;

	messages
		.create({
			chatroom_cid: msg.chatroom_cid,
			sender_uid: msg.sender_uid,
			content: msg.content
		})
		.then(msg => {
			chatrooms
				.findOne({
					where: {
						cid: msg.chatroom_cid
					}
				})
				.then(result => {
					result.last_message = msg.content;
					result.read_members = [];
					return result.save();
				})
				.then(result => {
					result.members
						.filter(member => member !== msg.sender_uid)
						.map(member => websocketClientsInIndex[member])
						.forEach(user => {
							user.forEach(client => webSocketServerInstance_message.clients[client].send(JSON.stringify(msg)));
						});
				})
				.catch(err => {
					websocket.send(JSON.stringify(err));
				});
		})
		.catch(err => {
			websocket.send(JSON.stringify(err));
		});

	console.log(websocketClientsInIndex);
};

var websocketOnMessage = websocket => {
	websocket.on('message', buffer => {
		var msg = JSON.parse(buffer.toString());

		if (websocket.exwd_authorized !== true) {
			websocket.close();
		}

		console.log('message open ->', msg);

		websocketClientPushMessage(websocket, msg);

		redis.pipeline().set(websocket.exwd_token, websocket.exwd_uid).expire(websocket.exwd_token, 12000).exec((err, res) => {
			if (err) {
				websocket.send(JSON.stringify({
					status: 'bad',
					error: err
				}));
			}
		});
	});
};

var websocketOnClose = websocket => {
	websocket.on('close', (code, buffer) => {
		console.log(code, buffer.toString());
		websocketDelSession(websocket);
	});
};

var handleMessageConnection = websocket => {
	websocketOnClose(websocket);
	websocketInitialize(websocket);
	websocketAuthorize(websocket, [websocketAddSession, websocketOnMessage]);
};

module.exports = handleMessageConnection;
