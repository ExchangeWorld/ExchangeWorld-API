/**
 * Provides some methods related to chatrooms
 *
 * @class Chatroom
 */

'use strict';

var express = require('express');
var router = express.Router();

// Including tables
var exchanges = require('../ORM/Exchanges');
var messages = require('../ORM/Messages');
var users = require('../ORM/Users');

/**
 * Get chatroom's messages of an Exchange
 *
 * @method GET api/chatroom/exchange
 * @param  {Integer} eid The ID of exchange
 * @param  {Integer=0} from From what number of messages
 * @param  {Integer=10} number How many messages to get
 * @return {JSON} Messages including `sender`
 */
router.get('/exchange', (req, res) => {

	var _eid = parseInt(req.query.eid, 10);
	var _from = parseInt(req.query.from, 10);
	var _number = parseInt(req.query.number, 10);

	// default _from is 0 and _number is 10
	// means you will get 10 latest messages in the chatroom
	_from = (_from == _from ? _from : 0);
	_number = (_number == _number ? _number : 10);

	exchanges
		.findOne({
			where: {
				eid: _eid
			}
		})
		.then(_exchange => {
			return messages
				.findAll({
					where: {
						chatroom_cid: _exchange.chatroom_cid
					},
					order: [
						['mid', 'DESC']
					],
					include: [{
						model: users,
						as: 'sender'
					}],
					offset: _from,
					limit: _number
				});
		})
		.then(result => {
			result
				.then(r => {
					res.json(r);
				});
		})
		.catch(err => {
			res.send({
				error: err
			});
		});

});

/**
 * Post a chatroom's message of an Exchange
 *
 * @method POST api/chatroom/exchange
 * @param  {Integer} eid The ID of exchange
 * @param  {Integer} sender_uid Who post the message
 * @param  {String} content The content of the message
 * @return {JSON} New created message object
 */
router.post('/exchange', (req, res) => {

	var _eid = parseInt(req.body.eid, 10);
	var _sender_uid = parseInt(req.body.sender_uid, 10);
	var _content = req.body.content;

	exchanges
		.findOne({
			where: {
				eid: _eid
			}
		})
		.then(_exchange => {
			return messages
				.create({
					sender_uid: _sender_uid,
					chatroom_cid: _exchange.chatroom_cid,
					content: _content
				});
		})
		.then(result => {
			result
				.then(r => {
					res.json(r);
				});
		})
		.catch(err => {
			res.send({
				error: err
			});
		});
});

/**
 * Read a chatroom's message
 *
 * @method PUT api/chatroom/read
 * @param  {Integer} cid The ID of chatroom
 * @param  {Integer} receiver_uid Who received the message (Not sender!)
 * @return {JSON} Updated message object
 */
router.put('/read', (req, res) => {

	var _cid = parseInt(req.body.cid, 10);
	var _receiver_uid = parseInt(req.body.receiver_uid, 10);

	messages
		.update({
			unread: false
		}, {
			where: {
				chatroom_cid: _cid,
				sender_uid: {
					$ne: _receiver_uid
				}
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
