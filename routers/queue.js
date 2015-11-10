'use strict';

var express = require('express');
var router = express.Router();

// Including tables
var queues = require('../ORM/Queues');
var goods = require('../ORM/Goods');
var users = require('../ORM/Users');

// Get queues of a goods
router.get('/of/goods', (req, res) => {

	// Available query params:
	//
	// host_goods_gid
	//

	var _host_goods_gid = parseInt(req.query.host_goods_gid, 10);

	queues
		.findAll({
			where: {
				host_goods_gid: _host_goods_gid
			},
			include: [{
				model: goods,
				as: 'host_goods',
				where: {
					exchanged: {
						$in: [0, 2]
					},
					deleted: 0
				}
			}, {
				model: goods,
				as: 'queuer_goods',
				where: {
					exchanged: {
						$in: [0, 2]
					},
					deleted: 0
				},
				include: [{
					model: users,
					as: 'owner'
				}]
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

// Get queues queued by a goods
// It means you take one thing to queue many other things
// And you want to get those many other things
router.get('/by/goods', (req, res) => {

	// Available query params:
	//
	// queuer_goods_gid
	//

	var _queuer_goods_gid = parseInt(req.query.queuer_goods_gid, 10);

	queues
		.findAll({
			where: {
				queuer_goods_gid: _queuer_goods_gid
			},
			include: [{
				model: goods,
				as: 'host_goods',
				where: {
					exchanged: {
						$in: [0, 2]
					},
					deleted: 0
				},
				include: [{
					model: users,
					as: 'owner'
				}]
			}, {
				model: goods,
				as: 'queuer_goods',
				where: {
					exchanged: {
						$in: [0, 2]
					},
					deleted: 0
				}
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

// Get queues that queue on me
router.get('/of/person', (req, res) => {

	// Available query params:
	//
	// host_user_uid
	//

	var _host_user_uid = parseInt(req.query.host_user_uid, 10);

	queues
		.findAll({
			include: [{
				model: goods,
				as: 'host_goods',
				where: {
					owner_uid: _host_user_uid,
					exchanged: {
						$in: [0, 2]
					},
					deleted: 0
				}
			}, {
				model: goods,
				as: 'queuer_goods',
				where: {
					exchanged: {
						$in: [0, 2]
					},
					deleted: 0
				},
				include: [{
					model: users,
					as: 'owner'
				}]
			}]
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

// Get what I queued on
router.get('/by/person', (req, res) => {

	// Available query params:
	//
	// queuer_user_uid
	//

	var _queuer_user_uid = parseInt(req.query.queuer_user_uid, 10);

	queues
		.findAll({
			include: [{
				model: goods,
				as: 'host_goods',
				where: {
					exchanged: {
						$in: [0, 2]
					},
					deleted: 0
				},
				include: [{
					model: users,
					as: 'owner'
				}]
			}, {
				model: goods,
				as: 'queuer_goods',
				where: {
					owner_uid: _queuer_user_uid,
					exchanged: {
						$in: [0, 2]
					},
					deleted: 0
				}
			}]
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

// Post a queue (queuer_goods_gid -> host_goods_gid)
router.post('/post', (req, res) => {

	// Necessary POST body params
	//
	// host_goods_gid
	// queuer_goods_gid
	//

	var _host_goods_gid = parseInt(req.body.host_goods_gid, 10);
	var _queuer_goods_gid = parseInt(req.body.queuer_goods_gid, 10);

	goods
		.findOne({
			where: {
				gid: _queuer_goods_gid,
				exchanged: 2
			}
		})
		.then(result => {
			if (result != null) {
				return {};
			} else {
				return queues
					.findOrCreate({
						where: {
							host_goods_gid: _host_goods_gid,
							queuer_goods_gid: _queuer_goods_gid
						},
						defaults: {
							host_goods_gid: _host_goods_gid,
							queuer_goods_gid: _queuer_goods_gid
						}
					});
			}
		})
		.then(result => {
			if (JSON.stringify(result) == JSON.stringify({})) {
				res.json(result);
			} else {
				res.json(result[0]);
			}
		})
		.catch(err => {
			res.send({
				error: err
			});
		});

});

// Delete a queue
router.delete('/delete', (req, res) => {

	// Necessary DELETE query params
	//
	// host_goods_gid
	// queuer_goods_gid
	//

	var _host_goods_gid = parseInt(req.query.host_goods_gid, 10);
	var _queuer_goods_gid = parseInt(req.query.queuer_goods_gid, 10);

	queues
		.destroy({
			where: {
				host_goods_gid: _host_goods_gid,
				queuer_goods_gid: _queuer_goods_gid
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
