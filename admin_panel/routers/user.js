'use strict';

var path = require('path');

var express = require('express');
var router = express.Router();

var auths = require(path.resolve(__dirname, '../../ORM/Auths.js'));
var chatrooms = require(path.resolve(__dirname, '../../ORM/Chatrooms.js'));
var comments = require(path.resolve(__dirname, '../../ORM/Comments.js'));
var exchanges = require(path.resolve(__dirname, '../../ORM/Exchanges.js'));
var follows = require(path.resolve(__dirname, '../../ORM/Follows.js'));
var goods = require(path.resolve(__dirname, '../../ORM/Goods.js'));
var messages = require(path.resolve(__dirname, '../../ORM/Messages.js'));
var notifications = require(path.resolve(__dirname, '../../ORM/Notifications.js'));
var queues = require(path.resolve(__dirname, '../../ORM/Queues.js'));
var stars = require(path.resolve(__dirname, '../../ORM/Stars.js'));
var users = require(path.resolve(__dirname, '../../ORM/Users.js'));

router.param('id', (req, res, next, id) => {
	let _restful_id = parseInt(id, 10);

	if (!(_restful_id)) {
		res.status(500).json({
			error: 'id is not a number'
		});

		return;
	}

	req.restful_id = _restful_id;

	next();
});

// Create
router.post('/', (req, res) => {
	console.log(req.restful_id);
	res.status(200).json(req.restful_id);
});

// Read
router.get('/:id', (req, res) => {
	users
		.findOne({
			where: {
				uid: req.restful_id
			},
			include: [{
				model: comments,
				as: 'comments',
				required: false,
				include: [{
					model: goods,
					as: 'goods',
					required: false
				}]
			}, {
				model: follows,
				as: 'follows_followed',
				required: false,
				include: [{
					model: users,
					as: 'follower',
					required: false
				}]
			}, {
				model: follows,
				as: 'follows_follower',
				required: false,
				include: [{
					model: users,
					as: 'followed',
					required: false
				}]
			}, {
				model: goods,
				as: 'goods',
				required: false
			}, {
				model: stars,
				as: 'star_starring_user',
				required: false,
				include: [{
					model: goods,
					as: 'goods',
					required: false
				}]
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

// Read by Query
router.get('/:id', (req, res) => {
	console.log(req.restful_id);
	res.status(200).json(req.restful_id);
});

// Update
router.put('/:id', (req, res) => {
	console.log(req.restful_id);
	res.status(200).json(req.restful_id);
});

// Delete
router.delete('/:id', (req, res) => {
	console.log(req.restful_id);
	res.status(200).json(req.restful_id);
});

module.exports = router;
