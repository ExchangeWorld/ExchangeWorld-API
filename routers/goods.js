/**
 * Provides some methods related to goods
 *
 * @class Goods
 */

'use strict';

var express = require('express');
var router = express.Router();

// Including tables
var goods = require('../ORM/Goods');
var users = require('../ORM/Users');
var comments = require('../ORM/Comments');
var stars = require('../ORM/Stars');
var exchanges = require('../ORM/Exchanges');

/**
 * Get a goods by given gid
 *
 * @method GET api/goods/
 * @param  {Integer} gid The ID of goods
 * @return {JSON} A goods including users, comments and stars
 */
router.get('/', (req, res) => {

	var _gid = parseInt(req.query.gid, 10);

	// Emit a find operation with orm model in table `goods`
	goods
		.findOne({
			where: {
				gid: _gid,
				deleted: 0
			},
			include: [{
				model: users,
				as: 'owner',
				required: true
			}, {
				model: comments,
				as: 'comments'
			}, {
				model: stars,
				as: 'star_goods',
				include: [{
					model: users,
					as: 'starring_user'
				}]
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
 * Get all goods of given owner_uid
 *
 * @method GET api/goods/of
 * @param  {Integer} owner_uid The owner
 * @return {JSON} The goods including comments and stars
 */
router.get('/of', (req, res) => {

	var _owner_uid = parseInt(req.query.owner_uid, 10);

	// Emit a find operation with orm model in table `goods`
	goods
		.findAll({
			where: {
				owner_uid: _owner_uid,
				deleted: 0
			},
			include: [{
				model: comments,
				as: 'comments'
			}, {
				model: stars,
				as: 'star_goods',
				include: [{
					model: users,
					as: 'starring_user'
				}]
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
 * Post a goods
 *
 * @method POST api/goods/post
 * @param  {String} name
 * @param  {String} category
 * @param  {String=''} description
 * @param  {String=''} photo_path
 * @param  {Float} position_x
 * @param  {Float} position_y
 * @param  {Integer} owner_uid
 * @return {JSON} New created goods object
 */
router.post('/post', (req, res) => {

	var _name = req.body.name;
	var _category = req.body.category;
	var _description = req.body.description || '';
	var _photo_path = req.body.photo_path || '';
	var _position_x = parseFloat(req.body.position_x);
	var _position_y = parseFloat(req.body.position_y);
	var _owner_uid = parseInt(req.body.owner_uid, 10);

	// Create instance
	goods
		.create({
			name: _name,
			category: _category,
			description: _description,
			photo_path: _photo_path,
			position_x: _position_x,
			position_y: _position_y,
			owner_uid: _owner_uid
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
 * Edit a goods
 *
 * @method PUT api/goods/edit
 * @param  {Integer} gid
 * @param  {String} name
 * @param  {String} category
 * @param  {String} description
 * @param  {String} photo_path
 * @param  {Float} position_x
 * @param  {Float} position_y
 * @return {JSON} Updated goods object
 */
router.put('/edit', (req, res) => {

	var _gid = parseInt(req.body.gid, 10);
	var _name = req.body.name;
	var _category = req.body.category;
	var _description = req.body.description || '';
	var _photo_path = req.body.photo_path || '';
	var _position_x = parseFloat(req.body.position_x);
	var _position_y = parseFloat(req.body.position_y);

	// Find the good which got right gid and update values
	goods
		.findOne({
			where: {
				gid: _gid
			}
		})
		.then(result => {
			if (result == null) {
				return {};
			} else {
				result.name = _name;
				result.category = _category;
				result.description = _description;
				result.photo_path = _photo_path;
				result.position_x = _position_x;
				result.position_y = _position_y;
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

/**
 * Rate a goods
 *
 * @method PUT api/goods/rate
 * @param  {Integer} gid The ID of goods
 * @param  {Float} rate The rate point!
 * @return {JSON} Updated goods object
 */
router.put('/rate', (req, res) => {

	var _gid = parseInt(req.body.gid, 10);
	var _rate = parseFloat(req.body.rate);

	if (_rate != _rate) {
		res.send({
			error: 'rate is NaN'
		});
	} else {
		goods
			.update({
				rate: _rate
			}, {
				where: {
					gid: _gid
				}
			})
			.then(_goods => {
				res.json(_goods);
			})
			.catch(err => {
				res.send({
					error: err
				});
			});
	}
});

/**
 * Delete a goods (but not really)
 * or if the goods is still in an exchange, this req will be ignored
 *
 * @method Delete api/goods/delete
 * @param  {Integer} gid The ID of goods
 * @return {JSON} Updated goods object
 */
router.delete('/delete', (req, res) => {

	var _gid = parseInt(req.query.gid, 10);

	exchanges
		.findOne({
			where: {
				$or: [{
					goods_one_gid: _gid
				}, {
					goods_two_gid: _gid
				}],
				status: 'initiated'
			}
		})
		.then(result => {
			if (result != null) {
				res.send({
					error: 'Exchange ' + result.eid + ' is in process'
				});
			} else {
				goods
					.update({
						deleted: 1
					}, {
						where: {
							gid: _gid
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
			}
		});
});

module.exports = router;
