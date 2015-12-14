/**
 * Provides some methods related to Search
 *
 * @class Search
 */

'use strict';

var express = require('express');
var router = express.Router();

// Including tables
var goods = require('../ORM/Goods');
var users = require('../ORM/Users');
var stars = require('../ORM/Stars');

/**
 * Get goods by given query
 *
 * @method GET api/goods/search
 * @param  {String=''} name
 * @param  {String=''} wishlist
 * @param  {String=''} category
 * @param  {Float=-1.0} position_x
 * @param  {Float=-1.0} position_y
 * @param  {Integer=-1} from
 * @param  {Integer=-1} to
 * @return {JSON} The goods including users and stars
 */
router.get('/', (req, res) => {
	var name = req.query.name || '';
	// var wishlist = req.query.wishlist || '';
	var category = req.query.category || '';
	// var position_x = parseFloat(req.query.position_x) || -1.0;
	// var position_y = parseFloat(req.query.position_y) || -1.0;
	var bound = req.query.bound || '-90,0,90,180';
	// var from = parseInt(req.query.from, 10) || -1;
	// var to = parseInt(req.query.to, 10) || -1;

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
			order: [
				['gid', 'DESC']
			],
			include: [{
				model: users,
				as: 'owner',
				required: true,
				attributes: ['uid', 'photo_path']
			}, {
				model: stars,
				as: 'star_goods',
				attributes: ['sid', 'starring_user_uid']
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

module.exports = router;
