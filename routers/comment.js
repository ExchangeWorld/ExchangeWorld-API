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

/**
 * Get comments of a user
 *
 * @method GET api/comment/of/user
 * @param  {Integer} commenter_uid The commenter's uid
 * @return {JSON} Comments including `goods`, and they are not deleted
 */
router.get('/of/user', (req, res) => {

	var _commenter_uid = parseInt(req.query.commenter_uid, 10);

	comments
		.findAll({
			where: {
				commenter_uid: _commenter_uid
			},
			order: 'cid DESC',
			include: [{
				model: goods,
				where: {
					deleted: 0
				},
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
	var _commenter_uid = parseInt(req.body.commenter_uid, 10);
	var _content = req.body.content;

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
			res.json(result);
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
