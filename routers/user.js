'use strict';

var express = require('express');
var router = express.Router();

// Including tables
var users = require('../ORM/Users');

// Get a user
router.get('/', (req, res) => {

	// Available query params:
	//
	// uid
	// identity
	//

	// Get property:value in ?x=y&z=w....
	var _uid = parseInt(req.query.uid, 10);
	var _identity = req.query.identity;

	// If uid or identity in query are not defined, then set them to zero or emptyString
	if (!_uid > 0) {
		_uid = 0;
	}

	if (_identity == undefined) {
		_identity = "";
	}

	if (!_identity.length > 0) {
		_identity = "";
	}

	// Emit a find operation with orm in table `users`
	users
		.findAll({
			where: {
				$or: [{
					uid: _uid
				}, {
					identity: _identity
				}]
			}
		})
		.then(result => {
			res.json(result);
		});
});

module.exports = router;
