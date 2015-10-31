'use strict';

var express = require('express');
var router = express.Router();

// Including tables
var messages = require('../ORM/Messages');
var users = require('../ORM/Users');

router.get('/', (req, res) => {

	// Available GET params:
	//
	// receiver_uid
	// sender_uid
	// from
	// number
	//

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
					as: 'receiver'
					required: true
				}, {
					model: users,
					as: 'sender'
					required: true
				}],
				// logging: true,
				// offset: _from,
				// limit: _number
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
					as: 'receiver'
					required: true
				}, {
					model: users,
					as: 'sender'
					required: true
				}],
				// logging: true,
				// offset: _from,
				// limit: _number
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

router.get('/between', (req, res) => {

	// Available GET params:
	//
	// receiver_uid
	// sender_uid
	// from
	// number
	//

	var _user1_uid = parseInt(req.query.user1_uid, 10);
	var _user2_uid = parseInt(req.query.user2_uid, 10);
	var _from = parseInt(req.query.from, 10);
	var _number = parseInt(req.query.number, 10);

	_from = (_from == _from ? _from : 0);
	_number = (_number == _number ? _number : 10);

	messages
		.findAll({
			where: {
				$and: [{
					$or: [{
						receiver_uid: _user1_uid,
						sender_uid: _user2_uid
					}, {
						receiver_uid: _user2_uid,
						sender_uid: _user1_uid
					}]

				}, {
					chatroom_cid: 0
				}]
			},
			order: [
				['mid', 'DESC']
			],
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

router.post('/', (req, res) => {

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
 * use to update read/unread
 */
router.put('/read', (req, res) => {

	// Available PUT body params:
	//
	// mid
	//

	// Get property:value in PUT body
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
