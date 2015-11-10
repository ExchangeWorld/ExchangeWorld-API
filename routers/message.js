/**
 * Provides some methods related to Messages
 *
 * @class Message
 */

'use strict';

var express = require('express');
var router = express.Router();

// Including tables
var messages = require('../ORM/Messages');
var users = require('../ORM/Users');

/**
 * Get messages by given receiver_uid and sender_uid
 *
 * @method GET api/message
 * @param  {Integer} receiver_uid
 * @param  {Integer} sender_uid It can be not provided, will ignore sender
 * @param  {Integer=0} from
 * @param  {Integer=10} number
 * @return {JSON} The messages including two users
 */
router.get('/', (req, res) => {

	var _receiver_uid = parseInt(req.query.receiver_uid, 10);
	var _sender_uid = parseInt(req.query.sender_uid, 10);
	var _from = parseInt(req.query.from, 10);
	var _number = parseInt(req.query.number, 10);

	_sender_uid = (_sender_uid == _sender_uid ? _sender_uid : null);
	_from = (_from == _from ? _from : 0);
	_number = (_number == _number ? _number : 10);

	if (_sender_uid == null) {
		messages
			.findAll({
				where: {
					receiver_uid: _receiver_uid,
					chatroom_cid: 0
				},
				order: [
					['mid', 'DESC']
				],
				include: [{
					model: users,
					as: 'sender',
					required: true
				}, {
					model: users,
					as: 'receiver',
					required: true
				}],
				// logging: true,
				offset: _from,
				limit: _number
			})
			.then(result => {
				res.json(result);
			})
			.catch(err => {
				res.send({
					error: err
				});
			});
	} else {
		messages
			.findAll({
				where: {
					receiver_uid: _receiver_uid,
					sender_uid: _sender_uid,
					chatroom_cid: 0
				},
				order: [
					['mid', 'DESC']
				],
				include: [{
					model: users,
					as: 'sender',
					attributes: ['name'],
					required: true
				}, {
					model: users,
					as: 'receiver',
					attributes: ['name'],
					required: true
				}],
				// logging: true,
				offset: _from,
				limit: _number
			})
			.then(result => {
				res.json(result);
			})
			.catch(err => {
				res.send({
					error: err
				});
			});
	}
});

/**
 * Get messages between two users
 *
 * @method GET api/message/between
 * @param  {Integer} user1_uid
 * @param  {Integer} user2_uid
 * @param  {Integer=0} from
 * @param  {Integer=10} number
 * @return {JSON} The messages including two users
 */
router.get('/between', (req, res) => {

	var _user1_uid = parseInt(req.query.user1_uid, 10);
	var _user2_uid = parseInt(req.query.user2_uid, 10);
	var _from = parseInt(req.query.from, 10);
	var _number = parseInt(req.query.number, 10);

	_from = (_from == _from ? _from : 0);
	_number = (_number == _number ? _number : 10);

	messages
		.findAll({
			where: {
				$or: [{
					receiver_uid: _user1_uid,
					sender_uid: _user2_uid
				}, {
					receiver_uid: _user2_uid,
					sender_uid: _user1_uid
				}],
				chatroom_cid: 0
			},
			order: [
				['mid', 'DESC']
			],
			include: [{
				model: users,
				as: 'sender',
				attributes: ['name'],
				required: true
			}, {
				model: users,
				as: 'receiver',
				attributes: ['name'],
				required: true
			}],
			offset: _from,
			limit: _number
		})
		.then(result => {
			res.json(result);
		})
		.catch(err => {
			res.send({
				error: err
			});
		});
});

/**
 * Post messages by given receiver and sender
 *
 * @method POST api/message/post
 * @param  {Integer} receiver_uid The receiver
 * @param  {Integer} sender_uid The sender
 * @param  {String} content The content
 * @return {JSON} New created message object
 */
router.post('/post', (req, res) => {

	var _receiver_uid = parseInt(req.body.receiver_uid, 10);
	var _sender_uid = parseInt(req.body.sender_uid, 10);
	var _content = req.body.content;

	messages
		.create({
			receiver_uid: _receiver_uid,
			sender_uid: _sender_uid,
			content: _content,
			chatroom_cid: 0
		})
		.then(result => {
			res.json(result);
		})
		.catch(err => {
			res.send({
				error: err
			});
		});
});

/**
 * Read a message
 *
 * @method PUT api/message/read
 * @param  {Integer} mid The ID of message
 * @return {JSON} Updated message object
 */
router.put('/read', (req, res) => {

	var _mid = parseInt(req.body.mid, 10);

	messages
		.update({
			unread: false
		}, {
			where: {
				mid: _mid
			}
		})
		.then(result => {
			res.json(result);
		})
		.catch(err => {
			res.send({
				error: err
			});
		});
});

module.exports = router;
