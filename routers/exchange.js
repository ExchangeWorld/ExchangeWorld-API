'use strict';

var express = require('express');
var Sequelize = require('sequelize');
var _ = require('lazy.js');
var router = express.Router();

// Including tables
var exchanges = require('../ORM/Exchanges');
var chatrooms = require('../ORM/Chatrooms')
var users = require('../ORM/Users');
var goods = require('../ORM/Goods');

// These routes are really dangerous
// Only use them when you know what are you doing
router.get('/all', (req, res) => {

	exchanges
		.findAll({
			where: {
				status: 'initiated'
			},
			include: [{
				model: goods,
				as: 'goods_one',
				include: [{
					model: users,
					as: 'owner',
				}],
				where: {
					exchanged: 2,
					deleted: 0
				}
			}, {
				model: goods,
				as: 'goods_two',
				include: [{
					model: users,
					as: 'owner',
				}],
				where: {
					exchanged: 2,
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

// Get exchanges of an user
// But not very well QAQ
router.get('/of/user/exchanging', (req, res) => {

	var _owner_uid = parseInt(req.query.owner_uid, 10);

	exchanges
		.findAll({
			include: [{
				model: goods,
				as: 'goods_one',
				include: [{
					model: users,
					as: 'owner',
					where: {
						uid: _owner_uid
					},
					required: false
				}]
			}, {
				model: goods,
				as: 'goods_two',
				include: [{
					model: users,
					as: 'owner',
					where: {
						uid: _owner_uid
					},
					required: false
				}]
			}]
		})
		.then(result => {
			res.json(_(JSON.parse(JSON.stringify(result)))
				.map(r => {

					if (r['goods_one']['owner'] == null) {
						r['owner_goods'] = r['goods_two'];
						r['other_goods'] = r['goods_one'];
					} else {
						r['owner_goods'] = r['goods_one'];
						r['other_goods'] = r['goods_two'];
					}

					delete r['owner_goods']['owner'];
					delete r['other_goods']['owner'];
					delete r['goods_one'];
					delete r['goods_two'];

					return r;
				})
				.toArray());
		})
		.catch(err => {
			// console.log(err);
			res.send({
				error: err
			});
		});
});


router.get('/', (req, res) => {

	// Available query params
	//
	// eid
	//

	var _eid = parseInt(req.query.eid, 10);

	exchanges
		.findOne({
			where: {
				eid: _eid,
				status: 'initiated'
			},
			include: [{
				model: goods,
				as: 'goods_one',
				include: [{
					model: users,
					as: 'owner',
				}]
			}, {
				model: goods,
				as: 'goods_two',
				include: [{
					model: users,
					as: 'owner',
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

// Create a new exchange
// Default status of an exchange is 'initiated'
router.post('/create', (req, res) => {

	// Available POST body params:
	//
	// goods_one_gid (smaller goods_gid)
	// goods_two_gid (larger goods_gid)
	//

	// Get property:value in POST body
	var __goods_one_gid = parseInt(req.body.goods_one_gid, 10);
	var __goods_two_gid = parseInt(req.body.goods_two_gid, 10);

	// And make sure goods_one_gid < goods_two_gid
	var _goods_one_gid = Math.min(__goods_one_gid, __goods_two_gid);
	var _goods_two_gid = Math.max(__goods_one_gid, __goods_two_gid);

	// Create instance
	// If there is already a pair (goods_one_gid, goods_two_gid) then do nothing
	exchanges
		.findOne({
			where: {
				$and: [{
					goods_one_gid: _goods_one_gid
				}, {
					goods_two_gid: _goods_two_gid
				}]
			}
		})
		.then(isThereAlready => {
			if (isThereAlready != null) {
				res.json(isThereAlready);
			} else {
				chatrooms
					.create({
						members: ''
					})
					.then(the_chatroom => {
						return exchanges
							.create({
								goods_one_gid: _goods_one_gid,
								goods_two_gid: _goods_two_gid,
								chatroom_cid: the_chatroom.cid
							});
					})
					.then(result => {

						var _goods_one_gid = result.goods_one_gid;

						goods
							.findOne({
								where: {
									gid: _goods_one_gid
								}
							})
							.then(_goods => {
								_goods.exchanged = 2;
								_goods.save().then(() => {});
							});

						return result;
					})
					.then(result => {

						var _goods_two_gid = result.goods_two_gid;

						goods
							.findOne({
								where: {
									gid: _goods_two_gid
								}
							})
							.then(_goods => {
								_goods.exchanged = 2;
								_goods.save().then(() => {});
							});

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
			}
		});
});

// Complete an exchange
// Set the status of an exchange to completed
// And **WHEN COMPLETED** any other exchanges contain either goods_one_gid or goods_two_gid \
// Must become 'dropped'
router.put('/complete', (req, res) => {

	// Available PUT body params:
	//
	// goods_one_gid (smaller goods_gid)
	// goods_two_gid (larger goods_gid)
	//

	// Get property:value in PUT body
	var __goods_one_gid = parseInt(req.body.goods_one_gid, 10);
	var __goods_two_gid = parseInt(req.body.goods_two_gid, 10);

	// And make sure goods_one_gid < goods_two_gid
	var _goods_one_gid = Math.min(__goods_one_gid, __goods_two_gid);
	var _goods_two_gid = Math.max(__goods_one_gid, __goods_two_gid);

	// First, any exchanges with goods_one_gid and goods_two_gid, \
	// their status will be set to 'dropped'.
	// Find instance and update its status to 'completed' then save
	exchanges
		.update({
			status: 'dropped'
		}, {
			where: {
				$or: [{
					goods_one_gid: _goods_one_gid
				}, {
					goods_two_gid: _goods_two_gid
				}]
			}
		})
		.then(tmp => {
			return exchanges
				.findOne({
					where: {
						goods_one_gid: _goods_one_gid,
						goods_two_gid: _goods_two_gid
					}
				});
		})
		.then(result => {
			if (result == null) {
				return {};
			} else {
				if (result.goods_one_agree == false || result.goods_two_agree == false) {
					return {};
				}
				result.status = 'completed';
				result.save().then(() => {});
				return result;
			}
		})
		.then(result => {
			if (result != {}) {
				goods
					.findOne({
						where: {
							gid: result.goods_one_gid
						}
					})
					.then(goods1 => {
						goods1.exchanged = 1;
						goods1.save().then(() => {});
					})
			}
			return result;
		})
		.then(result => {
			if (result != {}) {
				goods
					.findOne({
						where: {
							gid: result.goods_two_gid
						}
					})
					.then(goods2 => {
						goods2.exchanged = 1;
						goods2.save().then(() => {});
					})
			}
			return result;
		})
		.then(result => {
			res.json(result);
			return result;
		})
		.catch(err => {
			res.send({
				error: err
			});
		});

});

// Drop an exchange
// Set the status of an exchange to dropped
router.put('/drop', (req, res) => {

	// Available PUT body params:
	//
	// goods_one_gid (smaller goods_gid)
	// goods_two_gid (larger goods_gid)
	//

	// Get property:value in PUT body
	var __goods_one_gid = parseInt(req.body.goods_one_gid, 10);
	var __goods_two_gid = parseInt(req.body.goods_two_gid, 10);

	// And make sure goods_one_gid < goods_two_gid
	var _goods_one_gid = Math.min(__goods_one_gid, __goods_two_gid);
	var _goods_two_gid = Math.max(__goods_one_gid, __goods_two_gid);

	// Find instance and update its status to 'dropped' then save
	exchanges
		.findOne({
			where: {
				$and: [{
					goods_one_gid: _goods_one_gid
				}, {
					goods_two_gid: _goods_two_gid
				}]
			}
		})
		.then(result => {
			if (result == null) {
				return {};
			} else {
				result.status = 'dropped';
				result.save().then(() => {});
				return result;
			}
		})
		.then(result => {
			if (result != {}) {
				goods
					.findOne({
						where: {
							gid: result.goods_one_gid
						}
					})
					.then(goods1 => {
						goods1.exchanged = 0;
						goods1.save().then(() => {});
					})
			}
			return result;
		})
		.then(result => {
			if (result != {}) {
				goods
					.findOne({
						where: {
							gid: result.goods_two_gid
						}
					})
					.then(goods2 => {
						goods2.exchanged = 0;
						goods2.save().then(() => {});
					})
			}
			return result;
		})
		.then(result => {
			res.json(result);
			return result;
		})
		.catch(err => {
			res.send({
				error: err
			});
		});
});

// Change the agreement status of goods in the exchange
router.put('/agree', (req, res) => {

	// Available body params
	//
	// eid
	// goods_gid
	// agree (true or false)
	//
	var _eid = parseInt(req.body.eid, 10);
	var _goods_gid = parseInt(req.body.goods_gid, 10);
	var _agree = (req.body.agree == 'true' || req.body.agree == true ? true : false);

	exchanges
		.findOne({
			where: {
				eid: _eid,
				status: 'initiated'
			}
		})
		.then(result => {
			if (result == null) {
				return {};
			} else {
				if (result.goods_one_gid == _goods_gid) {
					result.goods_one_agree = _agree;
					result.save().then(() => {});
					return result;
				} else if (result.goods_two_gid == _goods_gid) {
					result.goods_two_agree = _agree;
					result.save().then(() => {});
					return result;
				} else {
					return {};
				}
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
