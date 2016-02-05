/**
 * Provides some methods related to goods
 *
 * @class Goods
 */

'use strict';

var path = require('path');

var express = require('express');
var router = express.Router();

// Including tables
var goods = require(path.resolve(__dirname, '../ORM/Goods'));
var users = require(path.resolve(__dirname, '../ORM/Users'));
var comments = require(path.resolve(__dirname, '../ORM/Comments'));
var stars = require(path.resolve(__dirname, '../ORM/Stars'));
var exchanges = require(path.resolve(__dirname, '../ORM/Exchanges'));
var queues = require(path.resolve(__dirname, '../ORM/Queues'));

/**
 * Get a goods by given gid
 *
 * @method GET api/goods/
 * @param  {Integer} gid The ID of goods
 * @return {JSON} A goods including users, comments and stars
 */
router.get('/', (req, res) => {
	var _gid = parseInt(req.query.gid, 10);

	if (!_gid) {
		res.status(400).json({
			error: 'gid is not given'
		});
		return;
	}

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
				required: true,
				attributes: ['uid', 'name', 'photo_path']
			}, {
				model: comments,
				as: 'comments'
			}, {
				model: stars,
				as: 'star_goods',
				// include: [{
				// 	model: users,
				// 	as: 'starring_user',
				// 	attributes: ['uid']
				// }],
				attributes: ['sid']
			}]
		})
		.then(result => {
			result.favorited = Boolean(result.star_goods.length);
			res.status(200).json(result);
		})
		.catch(err => {
			res.status(500).json({
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

	if (!_owner_uid) {
		res.status(400).json({
			error: 'owner_uid is not given'
		});
		return;
	}

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
					as: 'starring_user',
					attributes: ['uid', 'name', 'photo_path']
				}]
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
	var _owner_uid;

	// REQ EXWD CHECK
	if (req.exwd.admin) {
		_owner_uid = parseInt(req.body.owner_uid, 10);
	} else if (req.exwd.anonymous) {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		_owner_uid = req.exwd.uid;
	} else {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	}

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
			res.status(201).json(result);
		})
		.catch(err => {
			res.status(500).json({
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
	if (!_gid) {
		_gid = parseInt(req.query.gid, 10);
	}
	var _name = req.body.name;
	var _category = req.body.category;
	var _description = req.body.description || '';
	var _photo_path = req.body.photo_path || '';
	var _position_x = parseFloat(req.body.position_x);
	var _position_y = parseFloat(req.body.position_y);
	var _owner_uid;

	// REQ EXWD CHECK
	if (req.exwd.admin) {
		_owner_uid = null;
	} else if (req.exwd.anonymous) {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		_owner_uid = req.exwd.uid;
	} else {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	}

	var queryGoodsTmp = (req.exwd.admin ? {
		where: {
			gid: _gid
		}
	} : {
		where: {
			gid: _gid,
			owner_uid: _owner_uid
		}
	});

	// Find the good which got right gid and update values
	goods
		.findOne(queryGoodsTmp)
		.then(result => {
			if (result === null) {
				res.status(404).json(null);
			} else {
				result.name = _name;
				result.category = _category;
				result.description = _description;
				result.photo_path = _photo_path;
				result.position_x = _position_x;
				result.position_y = _position_y;
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
 * Rate a goods
 *
 * @method PUT api/goods/rate
 * @param  {Integer} gid The ID of goods
 * @param  {Float} rate The rate point!
 * @return {JSON} Updated goods object
 */
router.put('/rate', (req, res) => {
	var rater_uid;
	var _gid = parseInt(req.body.gid, 10);
	if (!_gid) {
		_gid = parseInt(req.query.gid, 10);
	}
	var _rate = parseFloat(req.body.rate);

	// REQ EXWD CHECK
	if (req.exwd.admin) {
		rater_uid = null;
	} else if (req.exwd.anonymous) {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		rater_uid = req.exwd.uid;
	} else {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	}

	if (_rate) {
		goods
			.update({
				rate: _rate
			}, {
				where: {
					gid: _gid
				}
			})
			.then(_goods => {
				res.status(200).json(_goods);
			})
			.catch(err => {
				res.status(500).json({
					error: err
				});
			});
	} else {
		res.status(400).json({
			error: 'rate is NaN'
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
	var _owner_uid;
	var _gid = parseInt(req.query.gid, 10);

	// REQ EXWD CHECK
	if (req.exwd.admin) {
		_owner_uid = null;
	} else if (req.exwd.anonymous) {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		_owner_uid = req.exwd.uid;
	} else {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	}

	var queryGoodsTmp = (req.exwd.admin ? {
		where: {
			gid: _gid
		}
	} : {
		where: {
			gid: _gid,
			owner_uid: _owner_uid
		}
	});

	exchanges
		.findOne({
			where: {
				$or: [{
					goods_one_gid: _gid
				}, {
					goods_two_gid: _gid
				}],
				status: {
					$in: ['initiated', 'completed']
				}
			}
		})
		.then(result => {
			if (result === null) {
				goods
					.update({
						deleted: 1
					}, queryGoodsTmp)
					.then(result => {
						res.status(200).json(result);
						return result;
					})
					.then(result => {
						console.log('After checking exchange, delete queue');
						return queues
							.destroy({
								where: {
									$or: [{
										host_goods_gid: _gid
									}, {
										queuer_goods_gid: _gid
									}]
								}
							});
					})
					.catch(err => {
						res.status(500).json({
							error: err
						});
					});
			} else {
				res.status(403).json({
					error: 'Exchange ' + result.eid + ' is in process or it is already exchanged'
				});
			}
		});
});

module.exports = router;
