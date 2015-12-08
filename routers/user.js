'use strict';

var express = require('express');
var router  = express.Router();

// Including tables
var users = require('../ORM/Users');

// Get a user
router.get('/', function(req, res, next) {

	// Available query params:
	//
	// uid
	// fb_id
	//

	// Get property:value in ?x=y&z=w....
	var _uid   = parseInt(req.query.uid, 10);
	var _fb_id = req.query.fb_id;

	// If uid or fb_id in query are not defined, then set them to zero or emptyString
	if (!_uid > 0) {
		_uid = 0;
	}

	if (_fb_id == undefined) {
		_fb_id = "";
	}

	if (!_fb_id.length > 0) {
		_fb_id = "";
	}

	// Emit a find operation with orm in table `users`
	users.findAll({
			where: {
				$or: [{
					uid: _uid
				}, {
					fb_id: _fb_id
				}]
			}
		})
		.then(function(result) {
			res.json(result);
		});
});

// Register a user
router.post('/register', function(req, res, next) {

	// Necessary params
	//
	// fb_id
	// name
	// email
	// photo_path
	//

	var _fb_id      = req.body.fb_id;
	var _name       = req.body.name;
	var _email      = req.body.email || '';
	var _photo_path = req.body.photo_path || '';

	// Create instance
	users.create({
			fb_id: _fb_id,
			name: _name,
			email: _email,
			photo_path: _photo_path
		})
		.then(function(result) {
			res.json(result);
		})
		.catch(function(err) {
			res.send({
				error: err
			});
			//res.json({});
		});
});

// Update a user's profile photo_path
router.put('/photo', (req, res, next) => {

	var _uid = parseInt(req.body.uid, 10);
	var _photo_path = req.body.photo_path || '';

	// PERMISSION CHECK
	var byuser = req.exwd.byuser;
	if (byuser === -1 || (byuser !== -2 && byuser !== _uid)) {
		res.send({
			error: 'Bad permission!'
		});
		return;
	}

	users.findOne({
			where: {
				uid: _uid
			}
		})
		.then(function(result) {
			if (result == null) {
				return {};
			} else {
				if (result.photo_path === _photo_path) {
					return result;
				}
				result.photo_path = _photo_path;
				result.save().then(function() {});
				return result;
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

module.exports = router;
