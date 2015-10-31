var express = require('express');
var router = express.Router();

// Including tables
var comments = require('../ORM/Comments');
var users = require('../ORM/Users');

// Get comments of a goods
router.get('/of/goods', (req, res) => {

	// Available query params
	//
	// goods_gid
	//

	var _goods_gid = parseInt(req.query.goods_gid, 10);

	comments
		.findAll({
			where: {
				goods_gid: _goods_gid
			},
			order: 'cid DESC',
			include: [{
				model: users,
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

// Get Comments of a user
router.get('/of/user', (req, res) => {

	// Available query params
	//
	// commenter_uid
	//

	var _commenter_uid = parseInt(req.query.commenter_uid, 10);

	comments
		.findAll({
			where: {
				commenter_uid: _commenter_uid
			},
			order: 'cid DESC',
			include: [{
				model: goods,
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

// Post a comment to a goods
router.post('/post', (req, res) => {

	// Necessary POST body params
	//
	// goods_gid
	// commenter_uid
	//

	var _goods_gid = parseInt(req.body.goods_gid, 10);
	var _commenter_uid = parseInt(req.body.commenter_uid, 10);
	var _content = req.body.content;

	comments
		.create({
			goods_gid: _goods_gid,
			commenter_uid: _commenter_uid,
			content: _content
		})
		.then(result => {
			if (result == null) {
				res.json({});
			} else {
				res.json(result);
			}
		})
		.catch(err => {
			res.send({
				error: err
			});
		});
});

// Edit a comment
router.put('/edit', (req, res) => {

	// Necessary PUT body params
	//
	// cid
	// content
	//

	var _cid = parseInt(req.body.cid, 10);
	var _content = req.body.content;

	comments
		.findOne({
			where: {
				cid: _cid
			}
		})
		.then(result => {
			result.content = _content;
			result.save().then(() => {});
			return result;
		})
		.then(result => {
			if (result == null) {
				res.json(null);
			} else {
				res.json(result);
			}
		})
		.catch(err => {
			res.send({
				error: err
			});
		});
});

// Delete a comment
router.delete('/delete', (req, res) => {

	// Necessary DELETE query params
	//
	// cid
	//

	var _cid = parseInt(req.query.cid, 10);

	comments
		.destroy({
			where: {
				cid: _cid
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
