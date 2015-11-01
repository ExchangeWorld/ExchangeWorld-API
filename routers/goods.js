'use strict';

var express = require('express');
var router = express.Router();

// Including tables
var goods = require('../ORM/Goods');
var users = require('../ORM/Users');
var comments = require('../ORM/Comments');

// Get a good by given goods_gid
router.get('/', (req, res) => {

	// Available query params:
	//
	// gid
	//

	// Get property:value in ?x=y&z=w....
	var _gid = parseInt(req.query.gid, 10);

	// Emit a find operation with orm model in table `goods`
	goods
		.findAll({
			where: {
				gid: _gid
			},
			include: [{
				model: users,
				as: 'owner',
				required: true
			}, {
				model: comments,
				as: 'comments',
				// required: true
			}]
			// include: [{
			// 	all: true
			// }]
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

// Get goods by given owner_uid
router.get('/of', (req, res) => {

	// Available query params:
	//
	// owner_uid
	//

	// Get property:value in ?x=y&z=w....
	var _owner_uid = parseInt(req.query.owner_uid, 10);

	// Emit a find operation with orm model in table `goods`
	goods
		.findAll({
			where: {
				owner_uid: _owner_uid
			},
			include: [{
				model: comments,
				as: 'comments',
				// required: true
			}]
			// include: [{
			// 	all: true
			// }]
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

// Post a good
router.post('/post', (req, res) => {

	// Necessary POST body params:
	//
	// name
	// category
	// description
	// photo_path
	// position_x
	// position_y
	// owner_uid
	//

	// Get property:value in POST body
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

// Edit a good
router.put('/edit', (req, res) => {

	// Necessary PUT body params:
	//
	// gid
	// name
	// category
	// description
	// photo_path
	// position_x
	// position_y
	//

	// Get property:value in PUT body
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

// Rate a good
router.put('/rate', (req, res) => {

	// Necessary PUT body params:
	//
	// gid
	// rate
	//

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
				res.json({
					error: err
				});
			});
	}
})

// Delete a good (but not really delete it)
router.delete('/delete', (req, res) => {

	// Necessary query params:
	//
	// gid
	//

	// Get property:value in DELETE query
	var _gid = parseInt(req.query.gid, 10);

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
			res.json({
				error: err
			});
		});
});

module.exports = router;
