/**
 * Provides some methods related to queues
 * (queuer_goods -[queue]-> host_goods)
 *
 * @class Queue
 */

'use strict';

var express = require('express');
var router = express.Router();

// Including tables
var queues = require('../ORM/Queues');
var goods = require('../ORM/Goods');
var users = require('../ORM/Users');

/**
 * Get goods are queueing on given host_goods
 * (If queuer_goods is in another exchange, it will not be returned)
 *
 * @method GET api/queue/of/goods
 * @param  {Integer} host_goods_gid
 * @return {JSON} The queues including goods and owners
 */
router.get('/of/goods', (req, res) => {
	var _owner_uid;
	var _host_goods_gid = parseInt(req.query.host_goods_gid, 10);

	// REQ EXWD CHECK
	if (req.exwd.anonymous) {
		res.send({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		_owner_uid = req.exwd.uid;
	} else {
		res.send({
			error: 'Permission denied'
		});
		return;
	}

	var queryGoodsTmp = (req.exwd.admin ? {
		exchanged: {
			$in: [0, 2]
		},
		deleted: 0
	} : {
		exchanged: {
			$in: [0, 2]
		},
		deleted: 0,
		owner_uid: _owner_uid
	});

	queues
		.findAll({
			where: {
				host_goods_gid: _host_goods_gid
			},
			include: [{
				model: goods,
				as: 'host_goods',
				where: queryGoodsTmp,
				attributes: ['gid']
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
					as: 'owner',
					attributes: ['uid', 'name', 'photo_path']
				}],
				attributes: ['gid', 'name', 'photo_path', 'category', 'description']
			}],
			order: [
				['qid', 'ASC']
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
 * Get goods are queued by given queuer_goods
 *
 * @method GET api/queue/by/goods
 * @param  {Integer} queuer_goods_gid
 * @return {JSON} The queues including goods and owners
 */
router.get('/by/goods', (req, res) => {
	var _owner_uid;
	var _queuer_goods_gid = parseInt(req.query.queuer_goods_gid, 10);

	// REQ EXWD CHECK
	if (req.exwd.anonymous) {
		res.send({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		_owner_uid = req.exwd.uid;
	} else {
		res.send({
			error: 'Permission denied'
		});
		return;
	}

	var queryGoodsTmp = (req.exwd.admin ? {
		exchanged: {
			$in: [0, 2]
		},
		deleted: 0
	} : {
		exchanged: {
			$in: [0, 2]
		},
		deleted: 0,
		owner_uid: _owner_uid
	});

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
					as: 'owner',
					attributes: ['uid', 'name', 'photo_path']
				}],
				attributes: ['gid', 'name', 'photo_path', 'category', 'description']
			}, {
				model: goods,
				as: 'queuer_goods',
				where: queryGoodsTmp,
				attributes: ['gid']
			}],
			order: [
				['qid', 'DESC']
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
 * Get goods are queueing on someone's goods
 *
 * @method GET api/queue/of/person
 * @param  {Integer} host_user_uid Who owns the host_goods
 * @return {JSON} The queues including goods and owners
 */
router.get('/of/person', (req, res) => {
	var _host_user_uid;

	// REQ EXWD CHECK
	if (req.exwd.admin) {
		_host_user_uid = parseInt(req.query.host_user_uid, 10);
	} else if (req.exwd.anonymous) {
		res.send({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		_host_user_uid = req.exwd.uid;
	} else {
		res.send({
			error: 'Permission denied'
		});
		return;
	}

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
				},
				attributes: ['gid', 'name', 'photo_path', 'category', 'description']
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
					as: 'owner',
					attributes: ['uid', 'name', 'photo_path']
				}],
				attributes: ['gid', 'name', 'photo_path', 'category', 'description']
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

/**
 * Get goods are queued by someone's goods
 *
 * @method GET api/queue/by/person
 * @param  {Integer} queuer_user_uid Who owns the queuer_goods
 * @return {JSON} The queues including goods and owners
 */
router.get('/by/person', (req, res) => {
	var _queuer_user_uid;

	// REQ EXWD CHECK
	if (req.exwd.admin) {
		_queuer_user_uid = parseInt(req.query.queuer_user_uid, 10);
	} else if (req.exwd.anonymous) {
		res.send({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		_queuer_user_uid = req.exwd.uid;
	} else {
		res.send({
			error: 'Permission denied'
		});
		return;
	}

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
					as: 'owner',
					attributes: ['uid', 'name', 'photo_path']
				}],
				attributes: ['gid', 'name', 'photo_path', 'category', 'description']
			}, {
				model: goods,
				as: 'queuer_goods',
				where: {
					owner_uid: _queuer_user_uid,
					exchanged: {
						$in: [0, 2]
					},
					deleted: 0
				},
				attributes: ['gid', 'name', 'photo_path', 'category', 'description']
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

/**
 * Post a queue
 * (queuer_goods -[queue]-> host_goods)
 * (If queuer_goods is in another exchange return {})
 *
 * @method POST api/queue/post
 * @param  {Integer} host_goods_gid Which is queued
 * @param  {Integer} queuer_goods_gid Which is queueing
 * @return {JSON|Nothing} New created queue object, already created one or {}
 */
router.post('/post', (req, res) => {
	var _queuer_user_uid;
	var _host_goods_gid = parseInt(req.body.host_goods_gid, 10);
	var _queuer_goods_gid = parseInt(req.body.queuer_goods_gid, 10);

	// REQ EXWD CHECK
	if (req.exwd.admin) {
		_queuer_user_uid = null;
	} else if (req.exwd.anonymous) {
		res.send({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		_queuer_user_uid = req.exwd.uid;
	} else {
		res.send({
			error: 'Permission denied'
		});
		return;
	}

	var queryGoodsTmp = (req.exwd.admin ? {
		gid: _queuer_goods_gid,
		exchanged: 0
	} : {
		gid: _queuer_goods_gid,
		owner_uid: _queuer_user_uid,
		exchanged: 0
	});

	goods
		.findOne({
			where: queryGoodsTmp
		})
		.then(result => {
			if (result === null) {
				return '';
			}
			return queues
				.findOrCreate({
					where: {
						host_goods_gid: _host_goods_gid,
						queuer_goods_gid: _queuer_goods_gid
					}
				});
		})
		.then(result => {
			if (result === '') {
				res.send({
					error: 'The goods you want to put on the queue is already exchanging'
				});
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

/**
 * Delete a queue
 *
 * @method DELETE api/queue/delete
 * @param  {Integer} host_goods_gid Which is queued
 * @param  {Integer} queuer_goods_gid Which is queueing
 * @return {JSON} Number of deleted queues
 */
router.delete('/delete', (req, res) => {
	var _queuer_user_uid;
	var _host_goods_gid = parseInt(req.query.host_goods_gid, 10);
	var _queuer_goods_gid = parseInt(req.query.queuer_goods_gid, 10);

	// REQ EXWD CHECK
	if (req.exwd.admin) {
		_queuer_user_uid = null;
	} else if (req.exwd.anonymous) {
		res.send({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		_queuer_user_uid = req.exwd.uid;
	} else {
		res.send({
			error: 'Permission denied'
		});
		return;
	}

	var queryGoodsTmp = (req.exwd.admin ? {
		gid: _queuer_goods_gid
	} : {
		owner_uid: _queuer_user_uid
	});

	queues
		.findOne({
			where: {
				host_goods_gid: _host_goods_gid,
				queuer_goods_gid: _queuer_goods_gid
			},
			include: [{
				model: goods,
				as: 'host_goods',
				attributes: ['gid']
			}, {
				model: goods,
				as: 'queuer_goods',
				attributes: ['gid'],
				where: queryGoodsTmp,
				required: true
			}]
		})
		.then(result => {
			if (result === null) {
				res.json(0);
			} else if (result.queuer_goods === null) {
				res.send({
					error: 'Opertaion denied, not your goods'
				});
			} else {
				result.destroy().then(_tmp => res.json(_tmp));
			}
		})
		.catch(err => {
			res.send({
				error: err
			});
		});
});

module.exports = router;
