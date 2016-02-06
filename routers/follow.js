/**
 * Provides some methods related to follows
 * (follower -[follow]-> followed)
 *
 * @class Follow
 */

'use strict';

var path = require('path');

var express = require('express');
var router = express.Router();

// Including tables
var follows = require(path.resolve(__dirname, '../ORM/Follows'));
var users = require(path.resolve(__dirname, '../ORM/Users'));

/**
 * Get who follow the given followed_uid
 * (follower -[follow]-> followed)
 *
 * @method GET api/follow/followers/of
 * @param  {Integer} followed_uid The one be followed
 * @return {JSON} Users following given followed_uid
 */
router.get('/followers/of', (req, res) => {
	var _followed_uid = parseInt(req.query.followed_uid, 10);

	if (!_followed_uid) {
		res.status(400).json({
			error: 'followed_uid is not given'
		});
		return;
	}

	// Emit a find operation with orm in table `follows`
	follows
		.findAll({
			where: {
				followed_uid: _followed_uid
			},
			include: [{
				model: users,
				as: 'follower',
				attributes: ['uid', 'name', 'photo_path']
			}],
			order: [
				['fid', 'DESC']
			]
		})
		.then(result => {
			res.status(200).json(result);
		})
		.catch(err => {
			res.status(500).send({
				error: err
			});
		});
});

/**
 * Get who are followed by the given follower_uid
 * (follower -[follow]-> followed)
 *
 * @method GET api/follow/followed/by
 * @param  {Integer} follower_uid The follower
 * @return {JSON} Users followed by given follower_uid
 */
router.get('/followed/by', (req, res) => {
	var _follower_uid = parseInt(req.query.follower_uid, 10);

	if (!_follower_uid) {
		res.status(400).json({
			error: 'follower_uid is not given'
		});
		return;
	}

	// Emit a find operation with orm in table `follows`
	follows
		.findAll({
			where: {
				follower_uid: _follower_uid
			},
			include: [{
				model: users,
				as: 'followed',
				attributes: ['uid', 'name', 'photo_path']
			}],
			order: [
				['fid', 'DESC']
			]
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
 * Post a follow
 * (follower -[follow]-> followed)
 *
 * @method POST api/follow/post
 * @param  {Integer} follower_uid The follower
 * @param  {Integer} followed_uid The followed
 * @return {JSON} New created follow object, or if there is already one, return that one
 */
router.post('/post', (req, res) => {
	var _follower_uid;
	var _followed_uid = parseInt(req.body.followed_uid, 10);

	// REQ EXWD CHECK
	if (req.exwd.admin) {
		_follower_uid = parseInt(req.body.follower_uid, 10);
	} else if (req.exwd.anonymous) {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		_follower_uid = req.exwd.uid;
	} else {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	}

	if ((!_followed_uid) || (!_follower_uid)) {
		res.status(400).json({
			error: 'followed_uid or follower_uid are wrong'
		});
		return;
	}

	if (_follower_uid === _followed_uid) {
		res.status(403).json({
			error: 'One cannot follow oneself'
		});
		return;
	}

	// Create instance
	// But if there is already the pair(followed_uid, follower_uid)
	// Then don't create another
	follows
		.findOrCreate({
			where: {
				follower_uid: _follower_uid,
				followed_uid: _followed_uid
			}
		})
		.then((result, created) => {
			// console.log(JSON.stringify(result), JSON.stringify(created));
			res.status(201).json(result[0]);
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
});

/**
 * Delete a follow
 * (follower -[follow]-> followed)
 *
 * @method DELETE api/follow/delete
 * @param  {Integer} follower_uid The follower
 * @param  {Integer} followed_uid The followed
 * @return {JSON} Number of deleted follows
 */
router.delete('/delete', (req, res) => {
	var _follower_uid;
	var _followed_uid = parseInt(req.query.followed_uid, 10);

	// REQ EXWD CHECK
	if (req.exwd.admin) {
		_follower_uid = parseInt(req.query.follower_uid, 10);
	} else if (req.exwd.anonymous) {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		_follower_uid = req.exwd.uid;
	} else {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	}

	if ((!_followed_uid) || (!_follower_uid)) {
		res.status(400).json({
			error: 'followed_uid or follower_uid are wrong'
		});
		return;
	}

	follows
		.destroy({
			where: {
				follower_uid: _follower_uid,
				followed_uid: _followed_uid
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
