/**
 * Provides some methods related to notifications
 *
 * @class Notification
 */

'use strict';

var path = require('path');

var express = require('express');
var router = express.Router();

// Including tables
var notifications = require(path.resolve(__dirname, '../ORM/Notifications'));
var users = require(path.resolve(__dirname, '../ORM/Users'));

/**
 * Get notifications belong to a user
 *
 * @method GET api/notification/belongsTo
 * @param  {Integer} receiver_uid
 * @param  {Integer=0} offset
 * @param  {Integer=20} limit
 * @return {Array} The notifications including receiver
 */
router.get('/belongsTo', (req, res) => {
	var _receiver_uid;
	var _offset = parseInt(req.query.offset || 0, 10);
	var _limit = parseInt(req.query.limit || 20, 10);

	// REQ EXWD CHECK
	if (req.exwd.admin) {
		_receiver_uid = parseInt(req.query.receiver_uid, 10);
	} else if (req.exwd.anonymous) {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		_receiver_uid = req.exwd.uid;
	} else {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	}

	notifications
		.findAll({
			where: {
				receiver_uid: _receiver_uid
			},
			order: [
				['nid', 'DESC']
			],
			offset: _offset,
			limit: _limit
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
 * Get a notification by given nid
 *
 * @method GET api/notification
 * @param  {Integer} nid The ID of notification
 * @return {JSON} A notification including receiver
 */
router.get('/', (req, res) => {
	var _nid = parseInt(req.query.nid, 10);

	var _requester_uid;

	if (!_nid) {
		res.status(400).json({
			error: 'nid is not given'
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
		nid: _nid
	} : {
		nid: _nid,
		receiver_uid: _requester_uid
	});

	notifications
		.findOne({
			where: queryTmp,
			include: [{
				model: users,
				as: 'receiver',
				required: true
			}]
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
 * Read a notification
 *
 * @method PUT api/notification/read
 * @param {Integer} nid
 * @return {JSON} Updated notification object
 */
router.put('/read', (req, res) => {
	var _nid = parseInt(req.body.nid, 10);
	if (!_nid) {
		_nid = parseInt(req.query.nid, 10);
	}

	var _requester_uid;

	if (!_nid) {
		res.status(400).json({
			error: 'nid is not given'
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
		nid: _nid,
		read: false
	} : {
		nid: _nid,
		read: false,
		receiver_uid: _requester_uid
	});

	notifications
		.findOne({
			where: queryTmp
		})
		.then(result => {
			if (result) {
				result.read = true;
				return result.save();
			}

			return result;
		})
		.then(result => {
			if (result === null) {
				return null;
			} else {
				return users
					.findOne({
						where: {
							uid: _requester_uid
						}
					})
					.then(_user => {
						if (_user.extra_json.notification_numbers !== undefined) {
							_user.extra_json.notification_numbers.notification = 0;
						} else {
							_user.extra_json.notification_numbers = {
								message: [],
								notification: 0
							};
						}

						return _user.save();
					})
					.then(() => {
						return result;
					});
			}
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

module.exports = router;
