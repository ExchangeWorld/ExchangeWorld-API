/**
 * Provides some methods related to follows
 * (follower -[follow]-> followed)
 *
 * @class Follow
 */

'use strict';

var express = require('express');
var router = express.Router();

// Including tables
var follows = require('../ORM/follows');
var users = require('../ORM/Users');

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

	// Emit a find operation with orm in table `follows`
	follows
		.findAll({
			where: {
				followed_uid: _followed_uid
			},
			include: [{
				model: users,
				as: 'followed'
			}, {
				model: users,
				as: 'follower'
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
 * Get who are followed by the given follower_uid
 * (follower -[follow]-> followed)
 *
 * @method GET api/follow/followed/by
 * @param  {Integer} follower_uid The follower
 * @return {JSON} Users followed by given follower_uid
 */
router.get('/followed/by', (req, res) => {

	var _follower_uid = parseInt(req.query.follower_uid, 10);

	// Emit a find operation with orm in table `follows`
	follows
		.findAll({
			where: {
				follower_uid: _follower_uid
			},
			include: [{
				model: users,
				as: 'followed'
			}, {
				model: users,
				as: 'follower'
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
 * Post a follow
 * (follower -[follow]-> followed)
 *
 * @method POST api/follow/post
 * @param  {Integer} follower_uid The follower
 * @param  {Integer} followed_uid The followed
 * @return {JSON} New created follow object, or if there is already one, return that one
 */
router.post('/post', (req, res) => {

	var _follower_uid = parseInt(req.body.follower_uid, 10);
	var _followed_uid = parseInt(req.body.followed_uid, 10);

	// Create instance
	// But if there is already the pair(followed_uid, follower_uid)
	// Then don't create another
	follows
		.findOne({
			where: {
				follower_uid: _follower_uid,
				followed_uid: _followed_uid
			}
		})
		.then(isThereAlready => {
			if (isThereAlready != null) {
				return isThereAlready;
			} else {
				return follows
					.create({
						follower_uid: _follower_uid,
						followed_uid: _followed_uid
					});
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

	var _follower_uid = parseInt(req.query.follower_uid, 10);
	var _followed_uid = parseInt(req.query.followed_uid, 10);

	follows
		.destroy({
			where: {
				follower_uid: _follower_uid,
				followed_uid: _followed_uid
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
