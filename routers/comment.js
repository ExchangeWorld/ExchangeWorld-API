/**
 * Provides some methods related to comments
 *
 * @class Comment
 */

'use strict';

var express = require('express');
var router = express.Router();

// Including tables
var comments = require('../ORM/Comments');
var users = require('../ORM/Users');
var goods = require('../ORM/Goods');

/**
 * Get comments of a goods
 *
 * @method GET api/comment/of/goods
 * @param  {Integer} goods_gid The commented goods
 * @return {JSON} Comments including `commenter`
 */
router.get('/of/goods', (req, res) => {
	var _goods_gid = parseInt(req.query.goods_gid, 10);

	comments
		.findAll({
			where: {
				goods_gid: _goods_gid
			},
			include: [{
				model: users,
				as: 'commenter',
				required: true,
				attributes: ['uid', 'name', 'photo_path']
			}],
			order: [
				['cid', 'DESC']
			]
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

/**
 * Get comments of a user
 *
 * @method GET api/comment/of/user
 * @param  {Integer} commenter_uid The commenter's uid
 * @return {JSON} Comments including `goods`, and they are not deleted
 */
router.get('/of/user', (req, res) => {
	var _commenter_uid;

	// REQ EXWD CHECK
	if (req.exwd.admin) {
		_commenter_uid = parseInt(req.query.commenter_uid, 10);
	} else if (req.exwd.anonymous) {
		res.send({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		_commenter_uid = req.exwd.uid;
	} else {
		res.send({
			error: 'Permission denied'
		});
		return;
	}

	comments
		.findAll({
			where: {
				commenter_uid: _commenter_uid
			},
			include: [{
				model: goods,
				as: 'goods',
				where: {
					deleted: 0
				},
				attributes: ['gid', 'name', 'photo_path'],
				required: true
			}],
			order: [
				['cid', 'DESC']
			]
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

/**
 * Post a comment to a goods
 *
 * @method POST api/comment/post
 * @param  {Integer} goods_gid The commented goods
 * @param  {Integer} commenter_uid The commenter's uid
 * @param  {String} content The content of the comment
 * @return {JSON} New created comment
 */
router.post('/post', (req, res) => {
	var _goods_gid = parseInt(req.body.goods_gid, 10);
	var _commenter_uid;
	var _content = req.body.content;

	// REQ EXWD CHECK
	if (req.exwd.admin) {
		_commenter_uid = parseInt(req.body.commenter_uid, 10);
	} else if (req.exwd.anonymous) {
		res.send({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		_commenter_uid = req.exwd.uid;
	} else {
		res.send({
			error: 'Permission denied'
		});
		return;
	}

	comments
		.create({
			goods_gid: _goods_gid,
			commenter_uid: _commenter_uid,
			content: _content
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

/**
 * Edit a comment
 *
 * @method PUT api/comment/edit
 * @param  {Integer} cid The ID of the comment
 * @param  {String} content The NEW content of the comment
 * @return {JSON} Updated comment
 */
router.put('/edit', (req, res) => {
	var _cid = parseInt(req.body.cid, 10);
	var _commenter_uid;
	var _content = req.body.content;

	// REQ EXWD CHECK
	if (req.exwd.admin) {
		_commenter_uid = parseInt(req.body.commenter_uid, 10);
	} else if (req.exwd.anonymous) {
		res.send({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		_commenter_uid = req.exwd.uid;
	} else {
		res.send({
			error: 'Permission denied'
		});
		return;
	}

	var queryTmp = (req.exwd.admin ? {
		where: {
			cid: _cid
		}
	} : {
		where: {
			cid: _cid,
			commenter_uid: _commenter_uid
		}
	});

	comments
		.findOne(queryTmp)
		.then(result => {
			if (result === null) {
				res.json(null);
			} else {
				result.content = _content;
				result.save().then(() => res.json(result));
			}
		})
		.catch(err => {
			res.send({
				error: err
			});
		});
});

/**
 * Delete a comment
 *
 * @method DELETE api/comment/delete
 * @param  {Integer} cid The ID of the comment
 * @return {JSON} Number of deleted comments
 */
router.delete('/delete', (req, res) => {
	var _cid = parseInt(req.query.cid, 10);
	var _commenter_uid;

	// REQ EXWD CHECK
	if (req.exwd.admin) {
		_commenter_uid = parseInt(req.query.commenter_uid, 10);
	} else if (req.exwd.anonymous) {
		res.send({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		_commenter_uid = req.exwd.uid;
	} else {
		res.send({
			error: 'Permission denied'
		});
		return;
	}

	var queryTmp = (req.exwd.admin ? {
		where: {
			cid: _cid
		}
	} : {
		where: {
			cid: _cid,
			commenter_uid: _commenter_uid
		}
	});

	comments
		.destroy(queryTmp)
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
