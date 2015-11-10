/**
 * Provides some methods related to users' profile
 *
 * @class Profile
 */

'use strict';

var express = require('express');
var router = express.Router();

// Including tables
var users = require('../ORM/Users');

/**
 * Edit a user's profile
 *
 * @method PUT api/user/profile/edit
 * @param  {Integer} uid
 * @param  {String} name
 * @param  {String} email
 * @param  {String} introduction
 * @param  {String} wishlist
 * @return {JSON|Nothing} Updated user object, or if not found, return {}
 */
router.put('/edit', (req, res) => {

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
