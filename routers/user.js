/**
 * Provides some methods related to users
 *
 * @class User
 */

'use strict';

var path = require('path');

var express = require('express');
var router = express.Router();

// Including tables
var users = require(path.resolve(__dirname, '../ORM/Users'));
var goods = require(path.resolve(__dirname, '../ORM/Goods'));
var follows = require(path.resolve(__dirname, '../ORM/Follows'));
var stars = require(path.resolve(__dirname, '../ORM/Stars'));

/**
 * Get a user by given uid or identity
 *
 * @method GET api/user
 * @param  {Integer} uid The ID of user
 * @param  {String} identity User's identity
 * @return {JSON} The user including many things
 * @example
<pre>
{
  "uid": 8,
  "identity": "1234",
  "name": "假帳號",
  "email": "",
  "photo_path": "hahaha",
  "introduction": null,
  "wishlist": null,
  "created_at": "2016-01-18T02:36:29.740Z",
  "updated_at": "2016-01-18T02:36:29.740Z",
  "goods": [],
  "follows_followed": [
    {
      "fid": 1
    }
  ],
  "follows_follower": [],
  "star_starring_user": []
}
</pre>
 */
router.get('/', (req, res) => {
	var _uid = parseInt(req.query.uid, 10);
	var _identity = req.query.identity || '';

	// If uid or identity in query are not defined, then set them to zero or emptyString
	if (!_uid) {
		_uid = 0;
	}

	console.log(_uid, _identity);

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
				as: 'follows_followed',
				required: false,
				attributes: ['follower_uid']
			}, {
				model: follows,
				as: 'follows_follower',
				required: false,
				attributes: ['followed_uid']
			}, {
				model: stars,
				as: 'star_starring_user',
				include: [{
					model: goods,
					as: 'goods',
					where: {
						deleted: 0
					},
					required: false,
					attributes: ['gid', 'name', 'photo_path', 'category']
				}],
				required: false,
				attributes: ['sid']
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

router.get('/me', (req, res) => {
	var myId = req.exwd.uid || -1;

	// Emit a find operation with orm in table `users`
	users
		.findOne({
			where: {
				uid: myId
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
				as: 'follows_followed',
				required: false,
				attributes: ['fid']
			}, {
				model: follows,
				as: 'follows_follower',
				required: false,
				attributes: ['fid']
			}, {
				model: stars,
				as: 'star_starring_user',
				include: [{
					model: goods,
					as: 'goods',
					where: {
						deleted: 0
					},
					required: false,
					attributes: ['gid', 'name', 'photo_path', 'category']
				}],
				required: false,
				attributes: ['sid']
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
 * Edit a user's profile, need token
 *
 * @method PUT api/user/edit
 * @param  {Integer} uid
 * @param  {String} name
 * @param  {String} email
 * @param  {String} introduction
 * @param  {String} wishlist
 * @return {JSON|Nothing} Updated user object, or if not found, return null
 */
router.put('/edit', (req, res) => {
	var _uid;
	var _name = req.body.name;
	var _email = req.body.email;
	var _introduction = req.body.introduction;
	var _wishlist = req.body.wishlist;

	// REQ EXWD CHECK
	if (req.exwd.admin) {
		_uid = parseInt(req.body._uid, 10);
		if (!_uid) {
			_uid = parseInt(req.query.uid, 10);
		}
	} else if (req.exwd.anonymous) {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		_uid = req.exwd.uid;
	} else {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	}

	users
		.findOne({
			where: {
				uid: _uid
			}
		})
		.then(result => {
			if (result === null) {
				res.status(404).json(null);
			} else {
				result.name = _name;
				result.email = _email;
				result.introduction = _introduction;
				result.wishlist = _wishlist;
				result.save().then(() => res.status(200).json(result));
			}
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
});

/**
 * Update a user's photo_path
 * If same as the one in DB, nothing changed
 *
 * @method PUT api/user/photo
 * @param  {Integer} uid The ID of user
 * @param  {String=''} photo_path The path of user's photo
 * @return {JSON} Updated user object
 */
router.put('/photo', (req, res) => {
	var _uid = req.exwd.uid;
	var _photo_path = req.body.photo_path || '';

	users
		.findOne({
			where: {
				uid: _uid
			}
		})
		.then(result => {
			if (!result) {
				return null;
			}

			if (result.photo_path === _photo_path) {
				return result;
			}

			result.photo_path = _photo_path;
			result.save();
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

module.exports = router;
