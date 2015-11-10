/**
 * Provides some methods related to notifications
 *
 * @class Notification
 */

'use strict';

var express = require('express');
var router = express.Router();

// Including tables
var notifications = require('../ORM/Notifications');
var users = require('../ORM/Users');

/**
 * Get notifications belong to a user
 *
 * @method GET api/notification/belongsTo
 * @param  {Integer} receiver_uid
 * @param  {Integer=0} from
 * @param  {Integer=10} number
 * @return {JSON} The notifications including receiver and sender
 */
router.get('/belongsTo', (req, res) => {

	var _receiver_uid = parseInt(req.query.receiver_uid, 10);
	var _from = parseInt(req.query.from, 10);
	var _number = parseInt(req.query.number, 10);

	_from = (_from == _from ? _from : 0);
	_number = (_number == _number ? _number : 10);

	notifications
		.findAll({
			where: {
				receiver_uid: _receiver_uid
			},
			order: [
				['nid', 'DESC']
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
 * Get notification by given nid
 *
 * @method GET api/notification
 * @param  {Integer} nid The ID of notification
 * @return {JSON} A notification including receiver and sender
 */
router.get('/', (req, res) => {

	var _nid = parseInt(req.query.nid, 10);

	notifications
		.findOne({
			where: {
				nid: _nid
			},
			include: [{
				model: users,
				as: 'sender',
				required: true
			}, {
				model: users,
				as: 'receiver',
				required: true
			}]
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
 * Emit notification
 *
 * @method POST api/notification
 * @param  {Integer} sender_uid The user trigger the notification
 * @param  {Integer} receiver_uid Target user
 * @param  {String} trigger_url The trigger object's URL
 * @param  {String} content The content of the notification
 * @return {JSON} A notification including receiver and sender
 */
router.post('/', (req, res) => {

	var _sender_uid = parseInt(req.body.sender_uid);
	var _receiver_uid = parseInt(req.body.receiver_uid);
	var _trigger_url = req.body.trigger_url;
	var _content = req.body.content;

	notifications
		.create({
			sender_uid: _sender_uid,
			receiver_uid: _receiver_uid,
			trigger_url: _trigger_url,
			content: _content
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
 * Read a notification
 *
 * @method PUT api/notification/read
 * @param {Integer} nid
 * @return {JSON} Updated notification object
 */
router.put('/read', (req, res) => {

	var _nid = parseInt(req.body.nid, 10);

	notifications
		.update({
			unread: false
		}, {
			where: {
				nid: _nid
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
