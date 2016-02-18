/**
 * Provides some methods related to chatrooms
 *
 * @class Chatroom
 */

'use strict';

var path = require('path');

var express = require('express');
var router = express.Router();

// Including tables
var chatrooms = require(path.resolve(__dirname, '../ORM/Chatrooms'));
// var messages = require(path.resolve(__dirname, '../ORM/Messages'));
// var users = require(path.resolve(__dirname, '../ORM/Users'));

// [{
// 	cid: 1,
// 	lastmessage: 'Hello?',
// 	members: ['', '', '']
// }, {
// 	cid: 2,
// 	lastmessage: 'Bye!',
// 	members: ['', '', '']
// }];

router.get('/of/user', (req, res) => {
	var _chatter_uid;
	var _offset = parseInt((req.query.offset || 0), 10);
	var _limit = parseInt((req.query.limit || 20), 10);

	// REQ EXWD CHECK
	if (req.exwd.admin) {
		_chatter_uid = parseInt(req.query.chatter_uid, 10);
	} else if (req.exwd.anonymous) {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		_chatter_uid = req.exwd.uid;
	} else {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	}

	if (!_chatter_uid) {
		res.status(400).json({
			error: 'chatter uid is not given'
		});
		return;
	}

	chatrooms
		.findAll({
			where: {
				members: {
					$contains: [_chatter_uid]
				}
			},
			order: [
				['updated_at', 'DESC']
			],
			limit: _limit,
			offset: _offset
		})
		.then(result => {
			res.status(200).json(result);
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
});

router.post('/create', (req, res) => {
	var _members_json = JSON.parse(req.body.members_json);

	// REQ EXWD CHECK
	if (req.exwd.admin) {

	} else if (req.exwd.anonymous) {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		if (_members_json.indexOf(req.exwd.uid) === -1) {
			_members_json.push(req.exwd.uid);
		}
	} else {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	}

	if (_members_json.length < 2) {
		res.status(400).json({
			error: 'members_json is wrong'
		});
		return;
	}

	chatrooms
		.create({
			members: _members_json
		})
		.then(result => {
			res.status(201).json(result);
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
});

router.put('/join', (req, res) => {

});

router.put('/leave', (req, res) => {

});

router.delete('/delete', (req, res) => {
	var _chatter_uid;
	var _cid = parseInt(req.query.cid, 10);

	// REQ EXWD CHECK
	if (req.exwd.admin) {

	} else if (req.exwd.anonymous) {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		_chatter_uid = req.exwd.uid;
	} else {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	}

	if ((!_cid) || (!_chatter_uid)) {
		res.status(400).json({
			error: 'cid or chatter_uid is wrong'
		});
		return;
	}

	var queryTmp = (req.exwd.admin ? {
		where: {
			cid: _cid
		}
	} : {
		where: {
			cid: _cid,
			members: {
				$contains: [_chatter_uid]
			}
		}
	});

	chatrooms
		.destroy(queryTmp)
		.then(result => {
			res.status(200).json(result);
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
});

module.exports = router;
