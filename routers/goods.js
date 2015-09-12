var express = require('express');
var router  = express.Router();

// Including tables
var goods    = require('../ORM/Goods');
var users    = require('../ORM/Users');
var comments = require('../ORM/Comments');

// Get a good by given goods_gid
router.get('/', function(req, res, next) {

	// Available query params:
	//
	// gid
	//

	// Get property:value in ?x=y&z=w....
	var _gid = parseInt(req.query.gid, 10);

	// Set association between tables (users, goods) and (goods, comments)
	users.hasMany(goods, {foreignKey: 'owner_uid'});
	goods.belongsTo(users, {foreignKey: 'owner_uid'});
	goods.hasMany(comments, {foreignKey: 'goods_gid'});
	comments.belongsTo(goods, {foreignKey: 'goods_gid'});

	// Emit a find operation with orm model in table `goods`
	goods
		.sync({force: false})
		.then(function() {
			return goods.findAll({
				where: {
					gid: _gid
				},
				include: [users, comments]
			});
		})
		.then(function(result) {
			res.json(result);
		})
		.catch(function(err) {
			res.send({error: err});
		});
});

// Get goods by given owner_uid
router.get('/of', function(req, res, next) {

	// Available query params:
	//
	// owner_uid
	//

	// Get property:value in ?x=y&z=w....
	var _owner_uid = parseInt(req.query.owner_uid, 10);

	// Emit a find operation with orm model in table `goods`
	goods
		.sync({force: false})
		.then(function() {
			return goods.findAll({
				where: {
					owner_uid: _owner_uid
				}
			});
		})
		.then(function(result) {
			res.json(result);
		})
		.catch(function(err) {
			res.send({error: err});
		});
});

// Post a good
router.post('/post', function(req, res, next) {

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
	var _name        = req.body.name;
	var _category    = req.body.category;
	var _description = req.body.description || '';
	var _photo_path  = req.body.photo_path || '';
	var _position_x  = parseFloat(req.body.position_x);
	var _position_y  = parseFloat(req.body.position_y);
	var _owner_uid   = parseInt(req.body.owner_uid, 10);

	// Create instance
	goods
		.sync({force: false})
		.then(function() {
			return goods.create({
				name        : _name,
				category    : _category,
				description : _description,
				photo_path  : _photo_path,
				position_x  : _position_x,
				position_y  : _position_y,
				owner_uid   : _owner_uid
			});
		})
		.then(function(result) {
		   res.json(result);
		})
		.catch(function(err) {
			res.send({error: err});
		});

});

// Edit a good
router.put('/edit', function(req, res, next) {

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
	var _gid         = parseInt(req.body.gid, 10);
	var _name        = req.body.name;
	var _category    = req.body.category;
	var _description = req.body.description || '';
	var _photo_path  = req.body.photo_path || '';
	var _position_x  = parseFloat(req.body.position_x);
	var _position_y  = parseFloat(req.body.position_y);


	// Find the good which got right gid and update values
	goods
		.sync({
			force: false
		})
		.then(function() {
			return goods.findOne({
				where: {
					gid: _gid
				}
			});
		})
		.then(function(result) {
			if (result == null) {
				return {};
			} else {
				result.name        = _name;
				result.category    = _category;
				result.description = _description;
				result.photo_path  = _photo_path;
				result.position_x  = _position_x;
				result.position_y  = _position_y;
				result.save().then(function() {});
				return result;
			}
		})
		.then(function(result) {
			res.json(result);
		})
		.catch(function(err) {
			res.send({error: err});
		});
});

// Delete a good (but not really delete it)
router.delete('/delete', function(req, res, next) {

	// Necessary query params:
	//
	// gid
	//

	// Get property:value in DELETE query
	var _gid = parseInt(req.query.gid, 10);

	goods
		.sync({force: false})
		.then(function() {
			return goods.findOne({
				where: {
					gid: _gid
				}
			});
		})
		.then(function(result) {
			if (result == null) {
				return {};
			} else {
				result.deleted = 1;
				result.save().then(function() {});
				return result;
			}
		})
		.then(function(result) {
			res.json(result);
		});
});

module.exports = router;
