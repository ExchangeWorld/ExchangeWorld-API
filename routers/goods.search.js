/**
 * Provides some methods related to Search
 *
 * @class Search
 */

'use strict';

var path = require('path');

var express = require('express');
var router = express.Router();

// Including tables
var goods = require(path.resolve(__dirname, '../ORM/Goods'));
var users = require(path.resolve(__dirname, '../ORM/Users'));
var stars = require(path.resolve(__dirname, '../ORM/Stars'));

/**
 * Get goods by given query
 *
 * @method GET api/goods/search
 * @param  {String=''} name
 * @param  {String=''} wishlist
 * @param  {String=''} category
 * @param  {Float=-1.0} position_x
 * @param  {Float=-1.0} position_y
 * @param  {Integer=0} offset
 * @param  {Integer=100} limit
 * @return {Array} The goods including users and stars
 */
router.get('/', (req, res) => {
	var name = req.query.name || '';
	var category = req.query.category || '';
	var bound = req.query.bound || '-90,0,90,180';
	var offset = parseInt(req.query.offset || 0, 10);
	var limit = parseInt(req.query.limit || 100, 10);

	/*
	 * [ lat_lo, lng_lo, lat_hi, lng_hi ] for this bounds,
	 *   where "lo" corresponds to the southwest corner of the bounding box,
	 *   while "hi" corresponds to the northeast corner of that box.
	 */

	var boundArray = bound.split(',').map(parseFloat);

	// Emit a find operation with orm model in table `goods`
	goods
		.findAll({
			where: {
				$and: [{
					name: (name === '' ? {
						$ilike: '%'
					} : {
						$ilike: '%' + name + '%'
					}),
					category: (category === '' ? {
						$ilike: '%'
					} : {
						$ilike: '%' + category + '%'
					})
				}],
				position_x: {
					gt: boundArray[1],
					lt: boundArray[3]
				},
				position_y: {
					gt: boundArray[0],
					lt: boundArray[2]
				},
				exchanged: {
					$in: [0, 2]
				},
				deleted: 0
			},
			include: [{
				model: users,
				as: 'owner',
				required: true,
				attributes: ['uid', 'photo_path', 'name']
			}, {
				model: stars,
				as: 'star_goods',
				attributes: ['sid', 'starring_user_uid']
			}],
			attributes: ['gid', 'name', 'photo_path', 'category', 'position_x', 'position_y', 'description'],
			order: [
				['gid', 'DESC']
			],
			offset: offset,
			limit: limit
		})
		.then(result => {
			var _result = result.map(_goods => _goods.toJSON());

			// If the requester is registerrd, ADD starred property
			if (req.exwd.registered) {
				_result = _result.map(_goods => {
					_goods.starredByUser = _goods.star_goods.some(_star => _star.starring_user_uid === req.exwd.uid);
					return _goods;
				});
			}

			res.status(200).json(_result);
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
});

module.exports = router;
