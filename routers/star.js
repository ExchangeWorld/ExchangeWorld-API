'use strict';

var express = require('express');
var router = express.Router();

// Including tables
var stars = require('../ORM/Stars');
var goods = require('../ORM/Goods');
var users = require('../ORM/Users')

// Get users that star the goods
router.get('/to', (req, res) => {

	// Available query params
	//
	// goods_gid
	//

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

// Get goods that user stars
router.get('/by', (req, res) => {

	// Available query params
	//
	// starring_user_uid
	//

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

// Make a star to a goods
router.post('/post', (req, res) => {

	// Necessary POST body params
	//
	// goods_gid
	// starring_user_uid
	//

	var _goods_gid = parseInt(req.body.goods_gid, 10);
	var _starring_user_uid = parseInt(req.body.starring_user_uid, 10);

	stars
		.create({
			goods_gid: _goods_gid,
			starring_user_uid: _starring_user_uid
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

// Delete a star
router.delete('/delete', (req, res) => {

	// Necessary DELETE query params
	//
	// goods_gid
	// starring_user_uid
	//

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
