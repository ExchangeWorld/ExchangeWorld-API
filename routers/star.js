/**
 * Provides some methods related to stars
 *
 * @class Star
 */

'use strict';

var express = require('express');
var router = express.Router();

// Including tables
var stars = require('../ORM/Stars');
var goods = require('../ORM/Goods');
var users = require('../ORM/Users');

/**
 * Get users who star the goods
 *
 * @method GET api/star/to
 * @param  {Integer} goods_gid The goods starred by a user
 * @return {JSON} The stars including user
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
				as: 'starring_user'
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
				}
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
 * Post a star
 *
 * @method POST api/star/post
 * @param  {Integer} goods_gid The goods starred by the user
 * @param  {Integer} starring_user_uid Who star the goods
 * @return {JSON} New created star object or already created one
 */
router.post('/post', (req, res) => {

	var _goods_gid = parseInt(req.body.goods_gid, 10);
	var _starring_user_uid = parseInt(req.body.starring_user_uid, 10);

	stars
		.findOrCreate({
			goods_gid: _goods_gid,
			starring_user_uid: _starring_user_uid
		})
		.then((result, created) => {
			res.json(result);
		})
		.catch(err => {
			res.send({
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
	var _starring_user_uid = parseInt(req.query.starring_user_uid, 10);

	stars
		.destroy({
			where: {
				goods_gid: _goods_gid,
				starring_user_uid: _starring_user_uid
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
