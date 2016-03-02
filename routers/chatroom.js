/**
 * Provides some methods related to chatrooms
 *
 * @class Chatroom
 */

'use strict';

var path = require('path');

var express = require('express');
var router = express.Router();

var async = require('async');

// Including tables
var chatrooms = require(path.resolve(__dirname, '../ORM/Chatrooms'));
var users = require(path.resolve(__dirname, '../ORM/Users'));

/**
 * Get a chatrooms meta of a user
 *
 * @method GET api/chatroom/of/user
 * @param  {Integer} user_uid The uid who wants the meta (But session-based, so not required in normal mode)
 * @param  {Integer=0} offset Retrive from which number of chatrooms (Like database offset)
 * @param  {Integer=20} limit How many chatrooms to retrive (Like database limit)
 * @return {Array} Chatrooms meta
 * @example
<pre>
[{
	cid: 1,
	lastmessage: 'Hello?',
	members: [1, 3]
}, {
	cid: 2,
	lastmessage: 'Bye!',
	members: [2, 4, 6, 8]
}];
</pre>
 */
router.get('/of/user', (req, res) => {
	var _user_uid;
	var _offset = parseInt((req.query.offset || 0), 10);
	var _limit = parseInt((req.query.limit || 20), 10);

	// REQ EXWD CHECK
	if (req.exwd.admin) {
		_user_uid = parseInt(req.query.user_uid, 10);
	} else if (req.exwd.anonymous) {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		_user_uid = req.exwd.uid;
	} else {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	}

	if (!_user_uid) {
		res.status(400).json({
			error: 'user_uid is not given'
		});
		return;
	}

	chatrooms
		.findAll({
			where: {
				members: {
					$contains: [_user_uid]
				}
			},
			order: [
				['updated_at', 'DESC']
			],
			limit: _limit,
			offset: _offset
		})
		.then(_chatrooms => {

			async
			.map(_chatrooms.map(c => c.toJSON()),
				(_chatroom, callback) => {
					users
						.findAll({
							where: {
								uid: {
									$in: _chatroom.members
								}
							},
							attributes: ['uid', 'name', 'photo_path']
						})
						.then(_users => {
							var members_info = {};

							_users.forEach(_user => {
								members_info[_user.uid] = {
									name: _user.name,
									photo_path: _user.photo_path
								};
							});

							_chatroom.members_info = members_info;

							return _chatroom;
						})
						.then(result => {
							callback(null, result);
						})
						.catch(err => {
							callback(err, null);
						});
				},
				(err, results) => {
					if (err) {
						res.status(500).json({
							error: err
						});
					}
					res.status(200).json(results);
				});
		});
});

/**
 * Let a user join a chatroom
 *
 * @method PUT api/chatroom/join
 * @param  {Integer} cid The id of the room wanna join
 * @param  {Integer} user_uid The id of the user who will join the chatroom (Can be others! Like invitation, but a user cannot invite itself to the chatroom)
 * @return {JSON} Modified chatroom object
 */
router.put('/join', (req, res) => {
	var _cid = parseInt(req.body.cid, 10);
	if (!_cid) {
		_cid = parseInt(req.query.cid, 10);
	}
	var _user_uid = parseInt(req.body.user_uid, 10);
	var _requester_uid;

	if (!_cid) {
		res.status(400).json({
			error: 'cid is not given'
		});
		return;
	}

	if (!_user_uid) {
		res.status(400).json({
			error: 'user_uid is not given'
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
			cid: _cid
		}
	} : {
		where: {
			cid: _cid,
			members: {
				$contains: [_requester_uid]
			}
		}
	});

	chatrooms
		.findOne(queryTmp)
		.then(result => {
			if (result) {
				let tmpSet = new Set(result.members);
				tmpSet.add(_user_uid);
				result.members = Array.from(tmpSet);
				return result.save();
			}
			return result;
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

/**
 * Leave from a chatroom
 *
 * @method PUT api/chatroom/leave
 * @param  {Integer} cid The id of the room wanna leave from
 * @param  {Integer} user_uid The id of the user who will leave the chatroom
 * @return {JSON} Modified chatroom object
 */
router.put('/leave', (req, res) => {
	var _cid = parseInt(req.body.cid, 10);
	if (!_cid) {
		_cid = parseInt(req.query.cid, 10);
	}
	var _user_uid = parseInt(req.body.user_uid, 10);
	var _requester_uid;

	if (!_cid) {
		res.status(400).json({
			error: 'cid is not given'
		});
		return;
	}

	if (!_user_uid) {
		res.status(400).json({
			error: 'user_uid is not given'
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
			cid: _cid
		}
	} : {
		where: {
			cid: _cid,
			members: {
				$contains: [_requester_uid]
			}
		}
	});

	chatrooms
		.findOne(queryTmp)
		.then(result => {
			if (result) {
				let tmpSet = new Set(result.members);
				tmpSet.delete(_user_uid);
				result.members = Array.from(tmpSet);
				return result.save();
			}
			return result;
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

/**
 * Create a chatroom
 *
 * @method POST api/chatroom/create
 * @param  {String} members_json A JSON-Stringified members array like "[1,2,3,4]", at least two people
 * @return {JSON} New created chatroom object
 */
router.post('/create', (req, res) => {
	var _members_json = JSON.parse(req.body.members_json);

	// REQ EXWD CHECK
	if (req.exwd.admin) {
		console.log('Nothing');
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
			error: 'members_json is too short, at least two'
		});
		return;
	}

	// Make it a Set !
	var tmpSet = new Set(_members_json);
	_members_json = Array.from(tmpSet);

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

/**
 * Delete a chatroom
 *
 * @method DELETE api/chatroom/delete
 * @param  {Integer} cid The id of the room going to be deleted
 * @return {Integer} The number of processed chatroom(s) (Should be 1)
 */
router.delete('/delete', (req, res) => {
	var _user_uid;
	var _cid = parseInt(req.query.cid, 10);

	// REQ EXWD CHECK
	if (req.exwd.admin) {
		console.log('Nothing');
	} else if (req.exwd.anonymous) {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		_user_uid = req.exwd.uid;
	} else {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	}

	if ((!_cid) || (!_user_uid)) {
		res.status(400).json({
			error: 'cid or user_uid is wrong'
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
				$contains: [_user_uid]
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
