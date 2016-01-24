/**
 * Provides some methods related to stars
 *
 * @class Star
 */

'use strict';

var path = require('path');

var express = require('express');
var router = express.Router();

// Including tables
var stars = require(path.resolve(__dirname, '../ORM/Stars'));
var goods = require(path.resolve(__dirname, '../ORM/Goods'));
var users = require(path.resolve(__dirname, '../ORM/Users'));

/**
 * Get users who star the goods
 *
 * @method GET api/star/to
 * @param  {Integer} goods_gid The goods starred by a user
 * @return {JSON} The stars including users
 */
router.get('/to', (req, res) => {
	var _goods_gid = parseInt(req.query.goods_gid, 10);

	stars
		.findAll({
			where: {
				goods_gid: _goods_gid
			},
			include: [{
				model: users,
				as: 'starring_user',
				attributes: ['uid', 'name', 'photo_path']
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
 * Get goods that a user stars
 *
 * @method GET api/star/by
 * @param  {Integer} starring_user_uid Who star the goods
 * @return {JSON} The stars including goods
 */
router.get('/by', (req, res) => {
	var _starring_user_uid = parseInt(req.query.starring_user_uid, 10);

	stars
		.findAll({
			where: {
				starring_user_uid: _starring_user_uid
			},
			include: [{
				model: goods,
				as: 'goods',
				where: {
					deleted: 0
				},
				attributes: ['gid', 'name', 'photo_path', 'category', 'description']
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
 * Post a star
 *
 * @method POST api/star/post
 * @param  {Integer} goods_gid The goods starred by the user
 * @param  {Integer} starring_user_uid Who star the goods
 * @return {JSON} New created star object or already created one
 */
router.post('/post', (req, res) => {
	var _goods_gid = parseInt(req.body.goods_gid, 10);
	var _starring_user_uid;

	// REQ EXWD CHECK
	if (req.exwd.admin) {
		_starring_user_uid = parseInt(req.body.starring_user_uid, 10);
	} else if (req.exwd.anonymous) {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		_starring_user_uid = req.exwd.uid;
	} else {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	}

	stars
		.findOrCreate({
			where: {
				goods_gid: _goods_gid,
				starring_user_uid: _starring_user_uid
			}
		})
		.then((result, created) => {
			res.status(201).json(result[0]);
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
});

/**
 * Delete a star
 *
 * @method DELETE api/star/delete
 * @param  {Integer} goods_gid The goods starred by the user
 * @param  {Integer} starring_user_uid Who star the goods
 * @return {JSON} Number of deleted stars
 */
router.delete('/delete', (req, res) => {
	var _goods_gid = parseInt(req.query.goods_gid, 10);
	var _starring_user_uid;

	// REQ EXWD CHECK
	if (req.exwd.admin) {
		_starring_user_uid = parseInt(req.query.starring_user_uid, 10);
	} else if (req.exwd.anonymous) {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		_starring_user_uid = req.exwd.uid;
	} else {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	}

	stars
		.destroy({
			where: {
				goods_gid: _goods_gid,
				starring_user_uid: _starring_user_uid
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
