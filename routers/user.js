/**
 * Provides some methods related to users
 *
 * @class User
 */

'use strict';

var express = require('express');
var router = express.Router();

// Including tables
var users = require('../ORM/Users');
var goods = require('../ORM/Goods');
var follows = require('../ORM/Follows');
var stars = require('../ORM/Stars');

/**
 * Get a user by given uid or identity
 *
 * @method GET api/user
 * @param  {Integer} uid The ID of user
 * @param  {String} identity User's identity
 * @return {JSON} The user including many things
 */
router.get('/', (req, res) => {

	var _uid = parseInt(req.query.uid, 10);
	var _identity = req.query.identity;

	// If uid or identity in query are not defined, then set them to zero or emptyString
	if (_uid != _uid) {
		_uid = 0;
	}

	if (_identity == undefined) {
		_identity = '';
	}

	if (!_identity.length > 0) {
		_identity = '';
	}

	// Emit a find operation with orm in table `users`
	users
		.findOne({
			where: {
				$or: [{
					uid: _uid
				}, {
					identity: _identity
				}]
			},
			include: [{
				model: goods,
				as: 'goods',
				where: {
					deleted: 0
				},
				required: false
			}, {
				model: follows,
				as: 'follows_followed'
			}, {
				model: follows,
				as: 'follows_follower'
			}, {
				model: stars,
				as: 'star_starring_user',
				include: [{
					model: goods,
					as: 'goods',
					where: {
						deleted: 0
					},
					required: false
				}]
			}]
		})
		.then(result => {
			res.json(result);
		});
});

module.exports = router;
