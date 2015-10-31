var express = require('express');
var router = express.Router();

// Including tables
var followings = require('../ORM/Followings');
var users = require('../ORM/Users');

// Get ther followings by given my_uid
router.get('/', (req, res) => {

	// Available query params:
	//
	// my_uid
	//

	var _my_uid = parseInt(req.query.my_uid, 10);

	// Emit a find operation with orm in table `followings`
	followings
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
				as: 'following',
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

// Post a following by given my_uid and the uid which my_uid follow
router.post('/post', (req, res) => {

	// Necessay POST body params:
	//
	// my_uid
	// following_uid
	//

	var _my_uid = parseInt(req.body.my_uid, 10);
	var _following_uid = parseInt(req.body.following_uid, 10);

	followings
		.findOne({
			where: {
				my_uid: _my_uid,
				following_uid: _following_uid
			}
		})
		.then(isThereAlready => {
			if (isThereAlready != null) {
				return isThereAlready;
			} else {
				return followings
					.create({
						my_uid: _my_uid,
						following_uid: _following_uid
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

// Delete a following by given my_uid and the uid which my_uid follow
router.delete('/delete', (req, res) => {

	// Necessay DELETE query params:
	//
	// my_uid
	// following_uid
	//

	var _my_uid = parseInt(req.query.my_uid, 10);
	var _following_uid = parseInt(req.query.following_uid, 10);

	followings
		.destroy({
			where: {
				my_uid: _my_uid,
				following_uid: _following_uid
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
