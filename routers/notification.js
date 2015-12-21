'use strict';

var express = require('express');
var router = express.Router();

var nodemailer = require('nodemailer');
var mailTransporter = nodemailer.createTransport({
	service: 'Gmail',
	auth: {
		user: 'exchangeworld.notification@gmail.com',
		pass: 'exwdtwnccucs'
	}
});

// Including tables
var notifications = require('../ORM/Notifications');
var users         = require('../ORM/Users');

router.get('/belongsTo', function(req, res, next) {

	// Available GET params:
	//
	// receiver_uid
	// from
	// number
	//

	var _receiver_uid = parseInt(req.query.receiver_uid, 10);
	var _from         = parseInt(req.query.from, 10);
	var _number       = parseInt(req.query.number, 10);

	_from   = (_from == _from ? _from : 0);
	_number = (_number == _number ? _number : 10);

	notifications.belongsTo(users, {foreignKey: 'sender_uid'});

	notifications.findAll({
			where: {
				receiver_uid: _receiver_uid
			},
			order: [
				['nid', 'DESC']
			],
			include: [{
				model: users,
				required: true
			}],
			offset: _from,
			limit: _number
		})
		.then(function(result) {
			res.json(result);
		})
		.catch(function(err) {
			res.json(err);
		});
});

router.get('/', function(req, res, next) {

	// Available GET params:
	//
	// nid
	//

	var _nid = parseInt(req.query.nid, 10);

	notifications.findAll({
			where: {
				nid: _nid
			},
		})
		.then(function(result) {
			res.json(result);
		})
		.catch(function(err) {
			res.json(err);
		});
});

router.post('/', function(req, res, next) {

	var _sender_uid   = parseInt(req.body.sender_uid);
	var _receiver_uid = parseInt(req.body.receiver_uid);
	var _trigger_url  = req.body.trigger_url;
	var _content      = req.body.content;

		notifications.create({
			sender_uid   : _sender_uid,
			receiver_uid : _receiver_uid,
			trigger_url  : _trigger_url,
			content      : _content
		})
		.then(function(result) {
			users
				.findOne({
					where: {
						uid: _receiver_uid
					}
				})
				.then(receiver_user => {
					if (receiver_user !== null && receiver_user.email !== '') {
						result.content = result.content.replace(/你/g, '您');
						var mailOptions = {
							from: 'ExchangeWorld 交換世界 <exchangeworld.notification@gmail.com>',
							to: receiver_user.name  + ' <' + receiver_user.email + '>',
							subject: 'ExchangeWorld 系統通知：' + result.content,
							text: receiver_user.name + ' 您好！\n\n'
							+ '「' + result.content + '」\n'
							+'請到 http://exwd.csie.org' + result.trigger_url + ' 查看喔！\n'
							+'\n (※此信件為系統發出信件，請勿直接回覆。若您有任何問題請至網站「回報」提出，謝謝！)\n'
							+'\n==============================\n'
							+'\nExchangeWorld - 交換樂趣！交換世界！\n'
							+'「聖誕節交換禮物活動進行中！尋找您的聖誕老公公！」'
							+'\n==> http://exwd.csie.org/seek?cate=Christmas\n'
							+'\n©Copyright 2015 - ExchangeWorld. All rights reserved.'
						};
						mailTransporter.sendMail(mailOptions, (error, info) => {
							if (error) {
								console.log(error);
							}
							console.log('Message sent: ' + info.response);
						});
					}
				})
				.catch(function(err) {
					console.log(err);
				});
			res.json(result);
		})
		.catch(function(err) {
			res.json(err);
		});
});

/**
 * use to update read/unread
 */
router.put('/', function(req, res, next) {

	// Available PUT body params:
	//
	// nid
	// unread
	//

	// Get property:value in PUT body
	var _nid    = parseInt(req.body.nid, 10);
	var _unread = Boolean(req.body.unread);

	notifications.update({
			unread: _unread
		}, {
			where: {
				nid: _nid
			}
		})
		.then(function(result) {
			res.json(result);
		})
		.catch(function(err) {
			res.send({
				error: err
			});
		});
});

module.exports = router;
