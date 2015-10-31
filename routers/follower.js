'use strict';

var express = require('express');
var router = express.Router();

// Including tables
var followers = require('../ORM/Followers');
var users = require('../ORM/Users');

// Get ther followers by given my_uid
router.get('/', (req, res) => {

	// Available query params:
	//
	// my_uid
	//

	var _my_uid = parseInt(req.query.my_uid, 10);

	// Emit a find operation with orm in table `followers`
	followers
		.findAll({
			where: {
				my_uid: _my_uid
			},
			include: [{
				model: users,
				as: 'my',
				required: true
			}, {
				model: users,
				as: 'follower',
				required: true
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

// Post a follower by given my_uid and the uid who follows my_uid
router.post('/post', (req, res) => {

	// Necessay POST body params:
	//
	// my_uid
	// follower_uid
	//

	var _my_uid = parseInt(req.body.my_uid, 10);
	var _follower_uid = parseInt(req.body.follower_uid, 10);

	// Create instance
	// But if there is already the pair(my_uid, follower_uid)
	// Then don't create another
	followers
		.findOne({
			where: {
				my_uid: _my_uid,
				follower_uid: _follower_uid
			}
		})
		.then(isThereAlready => {
			if (isThereAlready != null) {
				return isThereAlready;
			} else {
				return followers
					.create({
						my_uid: _my_uid,
						follower_uid: _follower_uid
					});
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

// Delete a follower by given my_uid and the uid who follows my_uid
router.delete('/delete', (req, res) => {

	// Necessay DELETE query params:
	//
	// my_uid
	// follower_uid
	//

	var _my_uid = parseInt(req.query.my_uid, 10);
	var _follower_uid = parseInt(req.query.follower_uid, 10);

	followers
		.destroy({
			where: {
				my_uid: _my_uid,
				follower_uid: _follower_uid
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
