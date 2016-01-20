/**
 * Provides some methods related to comments
 *
 * @class Comment
 */

'use strict';

var path = require('path');
var express = require('express');
var router = express.Router();

// Including tables
var comments = require(path.resolve(__dirname, '../ORM/Comments'));
var users = require(path.resolve(__dirname, '../ORM/Users'));
var goods = require(path.resolve(__dirname, '../ORM/Goods'));

/**
 * Get comments of a goods
 *
 * @method GET api/comment/of/goods
 * @param  {Integer} goods_gid The commented goods
 * @return {Array} Comments including `commenter`
 * @example
<pre>
[
  {
    "cid": 1,
    "content": "jjj",
    "created_at": "2016-01-18T01:51:52.778Z",
    "updated_at": "2016-01-18T01:51:52.778Z",
    "goods_gid": 3,
    "commenter_uid": 1,
    "commenter": {
      "uid": 1,
      "name": "許書軒",
      "photo_path": "https://scontent.xx.fbcdn.net/hprofile-xpa1/v/t1.0-1/c0.31.320.320/p320x320/1655895_607733372646261_973096312_n.jpg?oh=c0147be7e1838a34b761b5a6e1e8f723&oe=573B37D5"
    }
  }
]
</pre>
 */
router.get('/of/goods', (req, res) => {
	var _goods_gid = parseInt(req.query.goods_gid, 10);

	if (!_goods_gid) {
		res.status(400).json({
			error: 'goods_gid not given or it is wrong'
		});
		return;
	}

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
			res.status(200).json(result);
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
});

/**
 * Get comments of a user
 *
 * @method GET api/comment/of/user
 * @param  {Integer} commenter_uid The commenter's uid
 * @return {Array} Comments including `goods`, and they are not deleted
 * @example
<pre>
 [
  {
    "cid": 1,
    "content": "jjj",
    "created_at": "2016-01-18T01:51:52.778Z",
    "updated_at": "2016-01-18T01:51:52.778Z",
    "goods_gid": 3,
    "commenter_uid": 1,
    "goods": {
      "gid": 3,
      "name": "mm",
      "photo_path": "[\"http://exwd.csie.org/images/ab1bc08bc7737995cc788881bc7d168bf6f774c9f4d40aaf2abae1a16fc7d3b9.jpeg\"]"
    }
  }
]
</pre>
 */
router.get('/of/user', (req, res) => {
	var _commenter_uid;

	// REQ EXWD CHECK
	if (req.exwd.admin) {
		_commenter_uid = parseInt(req.query.commenter_uid, 10);
	} else if (req.exwd.anonymous) {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		_commenter_uid = req.exwd.uid;
	} else {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	}

	if (!_commenter_uid) {
		res.status(400).json({
			error: '_commenter_uid not given or it is wrong'
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
			res.status(200).json(result);
		})
		.catch(err => {
			res.status(500).json({
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
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		_commenter_uid = req.exwd.uid;
	} else {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	}

	if ((!_goods_gid) || (!_commenter_uid) || (!_content)) {
		res.status(400).json({
			error: 'goods_gid, commenter_uid or content wrong'
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
			res.status(201).json(result);
		})
		.catch(err => {
			res.status(500).json({
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
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		_commenter_uid = req.exwd.uid;
	} else {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	}

	if ((!_cid) || (!_commenter_uid) || (!_content)) {
		res.status(400).json({
			error: 'cid, commenter_uid or content wrong'
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
				res.status(404).json(null);
			} else {
				result.content = _content;
				result.save().then(() => res.status(200).json(result));
			}
		})
		.catch(err => {
			res.status(500).json({
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
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		_commenter_uid = req.exwd.uid;
	} else {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	}

	if ((!_cid) || (!_commenter_uid)) {
		res.status(400).json({
			error: 'cid or commenter_uid wrong'
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
			res.status(200).json(result);
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
});

module.exports = router;
