/**
 * Provides some methods related to Messages
 *
 * @class Message
 */

'use strict';

var path = require('path');

var express = require('express');
var router = express.Router();

// Including tables
var chatrooms = require(path.resolve(__dirname, '../ORM/Chatrooms'));
var messages = require(path.resolve(__dirname, '../ORM/Messages'));

/**
 * Get messages in a chatroom
 *
 * @method GET api/message/of/chatroom
 * @param  {Integer} chatroom_cid
 * @param  {Integer=0} offset
 * @param  {Integer=20} limit
 * @return {Array} The messages including two users
 */
router.get('/of/chatroom', (req, res) => {
	var _chatroom_cid = parseInt(req.query.chatroom_cid, 10);
	var _offset = parseInt(req.query.offset || 0, 10);
	var _limit = parseInt(req.query.limit || 20, 10);

	var _requester_uid;

	if (!_chatroom_cid) {
		res.status(400).json({
			error: 'chatroom_cid is not given'
		});
		return;
	}

	// REQ EXWD CHECK
	if (req.exwd.admin) {
		console.log('Nothing');
	} else if (req.exwd.anonymous) {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		_requester_uid = req.exwd.uid;
	} else {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	}

	var queryTmp = (req.exwd.admin ? {
		where: {
			cid: _chatroom_cid
		},
		include: [{
			model: messages,
			as: 'messages',
			required: true,
			offset: _offset,
			limit: _limit,
			order: [
				['mid', 'DESC']
			]
		}],
		attributes: ['cid', 'messages']
	} : {
		where: {
			cid: _chatroom_cid,
			members: {
				$contains: [_requester_uid]
			}
		},
		include: [{
			model: messages,
			as: 'messages',
			required: true,
			offset: _offset,
			limit: _limit,
			order: [
				['mid', 'DESC']
			]
		}]
	});

	chatrooms
		.findOne(queryTmp)
		.then(result => {
			if (result) {
				res.status(200).json(result.messages);
			} else {
				res.status(200).json([]);
			}
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
});

module.exports = router;
