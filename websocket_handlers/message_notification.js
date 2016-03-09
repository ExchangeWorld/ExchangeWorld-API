'use strict';

/* Client sends to back-end:
 *
 * 1. Send a message
 * {
 *     type: 'message',
 *     chatroom_cid: chatroom_cid,
 *     content: CONTENT
 * }
 *
 * 2. Read a message
 * {
 *     type: 'read',
 *     read_chatroom: chatroom_cid
 * }
 *
 */

/* Server sends to fron-end:
 *
 * 1. New message
 * {
 *     type: 'message',
 *     sender_uid: sender_uid,
 *     chatroom_cid: chatroom_cid,
 *     content: CONTENT
 * }
 *
 *
 * 2. New read_members data
 * {
 *     type: 'read',
 *     read_chatroom: chatroom_cid,
 *     read_members: [1, 2, 3]
 * }
 *
 * 3. New notification
 * {
 *     type: 'notification',
 *     codeType: statusCode,
 *     payload: {
 *         ....
 *     }
 * }
 */

// Token expire time
const TOKEN_EXPIRE_TIME = 604800;

var path = require('path');
var url = require('url');

var redis = require(path.resolve(__dirname, '../libs/redis'));

var messages = require(path.resolve(__dirname, '../ORM/Messages'));
var chatrooms = require(path.resolve(__dirname, '../ORM/Chatrooms'));

// 取得 websocket 在 websocketServer.clients 中的位置，為了更快的速度所以必須快取為辭典
var websocketClientsInIndex = {};
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

// Message 專用的 WebSocket 處理中樞個體
var webSocketServerInstance = require(path.resolve(__dirname, './foreman')).webSocketServerInstance;

// WebSocket 在被成立的時候，做的初始化動作
var websocketInitialize = websocket => {
	websocket.exwd_authorized = false;
	var tmpQuery = url.parse(websocket.upgradeReq.url, true).query;
	websocket.exwd_token = tmpQuery.token;
};

// WebSocket 初始化過程中的最後一步，就是認證是否為合法使用者，並且知道是誰
// 然後 callbacks 會在認證成功之後，依序執行
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

			redis.pipeline().set(_token, result).expire(_token, TOKEN_EXPIRE_TIME).exec((err, res) => {
				if (err) {
					websocket.send(JSON.stringify({
						status: 'bad',
						error: err
					}));
				} else {
					callbacks.forEach(cbf => cbf(websocket));
				}
			});
		}
	});
};

// 當 WebSocket 要被加入 sessions 的時候的操作
// 使用者會對應一個 Array，然後 Array 會存著使用者的各個上線個體
var websocketAddSession = websocket => {
	var uid = websocket.exwd_uid;

	if (uid in websocketClientsInIndex) {
		websocketClientsInIndex[uid].push(indexOf(webSocketServerInstance.clients, websocket));
	} else {
		websocketClientsInIndex[uid] = [indexOf(webSocketServerInstance.clients, websocket)];
	}
};

// 當 WebSocket 要被刪除時，要做的動作
var websocketDelSession = websocket => {
	var uid = websocket.exwd_uid;
	var tmpIndex = indexOf(webSocketServerInstance.clients, websocket);

	if (uid in websocketClientsInIndex) {
		websocketClientsInIndex[uid].splice(tmpIndex, 1);
	}
};

// 當使用者推了一句訊息時
var websocketClientPushMessage = (websocket, msgObj) => {
	messages
		.create({
			chatroom_cid: msgObj.chatroom_cid,
			sender_uid: websocket.exwd_uid,
			content: msgObj.content
		})
		.then(_msg => {
			var msg = _msg.toJSON();
			msg.type = 'message';

			chatrooms
				.findOne({
					where: {
						cid: msg.chatroom_cid
					}
				})
				.then(result => {
					result.last_message = msg.content;
					result.last_message_time = (new Date());
					result.read_members = [msg.sender_uid];
					return result.save();
				})
				.then(result => {
					result.members
						.filter(member => member !== msg.sender_uid)
						.map(member => websocketClientsInIndex[member])
						.forEach(onlineClients => {
							onlineClients.forEach(client => webSocketServerInstance.clients[client].send(JSON.stringify(msg)));
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

// 當使用者讀了聊天室時
var websocketClientReadChatroom = (websocket, msgObj) => {
	chatrooms
		.findOne({
			where: {
				cid: msgObj.read_chatroom
			}
		})
		.then(result => {
			// Set operation
			var _set = new Set(result.read_members);
			_set.add(websocket.exwd_uid);
			result.read_members = Array.from(_set);

			return result.save();
		})
		.then(result => {
			result.members
				.filter(member => member !== websocket.exwd_uid)
				.map(member => websocketClientsInIndex[member])
				.forEach(onlineClients => {
					onlineClients.forEach(client => webSocketServerInstance.clients[client].send(JSON.stringify({
						type: 'read',
						read_chatroom: result.cid,
						read_members: result.read_members
					})));
				});
		})
		.catch(err => {
			websocket.send(JSON.stringify(err));
		});
};

// 當前端送了一個 message 時
var websocketOnMessage = websocket => {
	websocket.on('message', buffer => {
		var msgObj = JSON.parse(buffer.toString());

		if (websocket.exwd_authorized !== true) {
			websocket.close();
		}

		var _type = msgObj.type;

		if (_type === 'message') {
			console.log('message open ->', msgObj);
			websocketClientPushMessage(websocket, msgObj);
		} else if (_type === 'read') {
			console.log('chatroom read ->', msgObj);
			websocketClientReadChatroom(websocket, msgObj);
		} else {
			console.log('no type QAQ default to type:message');
			websocketClientPushMessage(websocket, msgObj);
		}

		redis.pipeline().set(websocket.exwd_token, websocket.exwd_uid).expire(websocket.exwd_token, TOKEN_EXPIRE_TIME).exec((err, res) => {
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

var handleConnection = websocket => {
	websocketOnClose(websocket);
	websocketInitialize(websocket);
	websocketAuthorize(websocket, [websocketAddSession, websocketOnMessage]);
};

module.exports = handleConnection;
