'use strict';

var path = require('path');
var crypto = require('crypto');

var express = require('express');
var router = express.Router();

var sec_ran = require('secure-random');
var validator = require('validator');

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

// Hashcode generation functions
var getSHA256 = strToEncrypt => {
	var sha256 = crypto.createHash('sha256');
	sha256.update(strToEncrypt, 'utf8');
	return sha256.digest('hex');
};

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
	var _tmpfb = (req.body.fb || '');
	var _fb = (_tmpfb === 'true' || _tmpfb === true);
	var _id = req.body.identity || '';
	var _password = req.body.password || '';
	var _name = req.body.name || '';
	var _email = req.body.email || '';
	var _photo_path = req.body.photo_path || '';

	// Create password for fb
	if (_fb === true) {
		var id_length = _id.length;
		_password = getSHA256(_id.substring(id_length - 2, id_length) + ' and this is still a fucking hash with ' + _id.substring(0, id_length - 2));
	}

	// Check if the _password is not valid
	if (_password.length < 4) {
		res.status(400).json({
			error: 'Password must be specified and it must contain at least 4 characters'
		});

		return;
	}

	// Check if the _id is not valid
	if (_id === '') {
		res.status(400).json({
			error: 'ID must be specified'
		});

		return;
	}

	// Check if the _id is not valid
	if (_name === '') {
		res.status(400).json({
			error: 'Name must be specified'
		});

		return;
	}

	// Check Email
	if (_email !== '' && validator.isEmail(_email) === false) {
		res.status(400).json({
			error: 'Email is wrong'
		});

		return;
	}

	// Create user instance
	users
		.create({
			identity: _id,
			name: _name,
			email: _email,
			photo_path: _photo_path
		})
		.then(result => {
			var _salt = JSON.stringify(sec_ran.randomArray(7));

			var _answer = getSHA256(_password + ' and this is a fucking hash with ' + _salt);

			auths
				.create({
					user_identity: _id,
					salt: _salt,
					answer: _answer,
					user_uid: result.uid
				})
				.catch(err => {
					res.status(500).json({
						error: err
					});
				});

			return result;
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
router.get('/', (req, res) => {
	let query;
	let offset = parseInt(req.query.offset, 10);
	let limit = parseInt(req.query.limit, 10);

	req.query.order = req.query.order || 'ASC';
	let order = (req.query.order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC');

	try {
		query = JSON.parse(req.query.q);
	} catch (err) {
		res.status(400).json({
			error: 'query json is mal-formed'
		});
		return;
	}

	users
		.findAll({
			where: query,
			order: [
				['uid', order]
			],
			offset: offset,
			limit: limit
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

// Update
router.put('/:id', (req, res) => {
	users
		.findOne({
			where: {
				uid: req.restful_id
			}
		})
		.then(result => {
			let _result = result.toJSON();
			for (let item in req.query) {
				if (item in _result) {
					result[item] = req.query[item];
				}
			}

			return result.save();
		})
		.then(() => {
			res.status(204).end();
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
});

// Delete
router.delete('/:id', (req, res) => {
	console.log(req.restful_id);
	res.status(200).json(req.restful_id);
});

module.exports = router;
