'use strict';

var express = require('express');
var router = express.Router();

// Including tables
var users = require('../ORM/Users');
var goods = require('../ORM/Goods');
var followers = require('../ORM/Followers');
var followings = require('../ORM/Followings');

// Get a profile
router.get('/', (req, res) => {

	// Available query params:
	//
	// uid
	//

	// Get property:value in ?x=y&z=w....
	var _uid = parseInt(req.query.uid, 10);

	// Emit a find operation with orm model in table `users`
	users
		.findOne({
			where: {
				uid: _uid
			},
			include: [{
				model: goods,
				as: 'goods'
			}, {
				model: followers,
				as: 'followers_my'
			}, {
				model: followings,
				as: 'followings_my'
			}]
		})
		.then(result => {
			if (result == null) {
				res.json({});
			} else {
				res.json(data);
			}
		})
		.catch(err => {
			res.send({
				error: err
			});
		});
});

// Edit a profile
router.put('/edit', (req, res) => {

	// Available PUT body params:
	//
	// uid
	// name
	// email
	// introduction
	// wishlist
	//

	var _uid = parseInt(req.body.uid, 10);
	var _name = req.body.name;
	var _email = req.body.email;
	var _introduction = req.body.introduction;
	var _wishlist = req.body.wishlist;

	users
		.findOne({
			where: {
				uid: _uid
			}
		})
		.then(result => {
			if (result == null) {
				return {};
			} else {
				result.name = _name;
				result.email = _email;
				result.introduction = _introduction;
				result.wishlist = _wishlist;
				result.save().then(() => {});
				return result;
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
