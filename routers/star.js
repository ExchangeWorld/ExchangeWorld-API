'use strict';

var express = require('express');
var router  = express.Router();

// Including tables
var stars = require('../ORM/Stars');
var goods = require('../ORM/Goods');

// Get users that star the goods
router.get('/to', function(req, res, next) {

	// Available query params
	//
	// goods_gid
	//

	var _goods_gid = parseInt(req.query.goods_gid, 10);

	stars.findAll({
			where: {
				goods_gid: _goods_gid
			}
		})
		.then(function(result) {
			res.json(result);
		})
		.catch(function(err) {
			res.send({
				error: err
			});
		});
});

// Get stars that start to the someone's goods
router.get('/toOwner', function(req, res, next) {
	var _owner_uid = parseInt(req.query.owner_uid, 10);

	goods.findAll({
			where: {
				owner_uid: _owner_uid
			}
		})
		.then(result => {
			if (result == null || result.length == 0) {
				return null;
			} else {
				var theGoodsGids = result.map(r => r.dataValues.gid);
				return stars.findAll({
					where: {
						goods_gid: {
							$in: theGoodsGids
						}
					}
				});
			}
		})
		.then(theStars => {
			if (theStars == null || theStars.length == 0) {
				res.json([]);
			} else {
				res.json(theStars);
			}
		})
		.catch(err => {
			console.log(err);
			res.send({
				error: err
			});
		});
});

// Get goods that user stars
router.get('/by', function(req, res, next) {

	// Available query params
	//
	// starring_user_uid
	//

	var _starring_user_uid = parseInt(req.query.starring_user_uid, 10);

	stars.belongsTo(goods, {foreignKey: 'goods_gid'});

	stars.findAll({
			where: {
				starring_user_uid: _starring_user_uid
			},
			include: [{
				model: goods,
				where: {
					deleted: 0
				},
				required: true
			}]
		})
		.then(function(result) {
			res.json(result);
		})
		.catch(function(err) {
			res.send({
				error: err
			});
			//res.json({error: err});
		});
});

// Make a star to a goods
router.post('/post', function(req, res, next) {

	// Necessary POST body params
	//
	// goods_gid
	// starring_user_uid
	//

	var _goods_gid         = parseInt(req.body.goods_gid, 10);
	var _starring_user_uid = parseInt(req.body.starring_user_uid, 10);

	stars.create({
			goods_gid: _goods_gid,
			starring_user_uid: _starring_user_uid
		})
		.then(function(result) {
			res.json(result);
		})
		.catch(function(err) {
			res.send({
				error: err
			});
			//res.json({error: err});
		});
});

// Delete a star
router.delete('/delete', function(req, res, next) {

	// Necessary DELETE query params
	//
	// goods_gid
	// starring_user_uid
	//

	var _goods_gid         = parseInt(req.query.goods_gid, 10);
	var _starring_user_uid = parseInt(req.query.starring_user_uid, 10);

	// PERMISSION CHECK
	var byuser = req.exwd.byuser;
	if (!(byuser != -1 && byuser === _starring_user_uid)) {
		res.send({
			error: 'Bad permission!'
		});
		return;
	}

	stars.destroy({
			where: {
				goods_gid: _goods_gid,
				starring_user_uid: _starring_user_uid
			}
		})
		.then(function(result) {
			res.json(result);
		})
		.catch(function(err) {
			//res.json({error: err});
			res.send({
				error: err
			});
		});
});

module.exports = router;
