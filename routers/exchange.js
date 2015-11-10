/**
 * Provides some methods related to EXCHANGES
 *
 * @class Exchange
 */

'use strict';

var express = require('express');
var Sequelize = require('sequelize');
var _ = require('lazy.js');
var router = express.Router();

// Including tables
var exchanges = require('../ORM/Exchanges');
var chatrooms = require('../ORM/Chatrooms');
var users = require('../ORM/Users');
var goods = require('../ORM/Goods');

/**
 * Get all of exchanges
 *
 * @method GET api/exchange/all
 * @return {JSON} Exchanges including goods and owners
 */
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
					as: 'owner'
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
					as: 'owner'
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

/**
 * Get all exchanges of a user
 *
 * @method GET api/exchange/of/user/all
 * @param  {Integer} owner_uid The owner
 * @return {JSON} Exchanges incluing goods( owner_goods, other_goods )
 */
router.get('/of/user/all', (req, res) => {

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
					where: {
						uid: _owner_uid
					},
					required: false
				}],
				where: {
					exchanged: 2,
					deleted: 0
				}
			}]
		})
		.then(result => {
			res.json(_(JSON.parse(JSON.stringify(result)))
				.map(r => {

					if (r['goods_one']['owner'] == null) {
						r['owner_goods'] = r['goods_two'];
						r['other_goods'] = r['goods_one'];
						r['owner_agree'] = r['goods_two_agree'];
						r['other_agree'] = r['goods_one_agree'];
					} else {
						r['owner_goods'] = r['goods_one'];
						r['other_goods'] = r['goods_two'];
						r['owner_agree'] = r['goods_one_agree'];
						r['other_agree'] = r['goods_two_agree'];
					}

					delete r['owner_goods']['owner'];
					delete r['other_goods']['owner'];
					delete r['goods_one'];
					delete r['goods_two'];
					delete r['goods_one_agree'];
					delete r['goods_two_agree'];

					return r;
				})
				.toArray());
		})
		.catch(err => {
			res.send({
				error: err
			});
		});
});

/**
 * Get an exchanges of a user
 *
 * @method GET api/exchange/of/user/one
 * @param  {Integer} eid The ID of the exchange
 * @param  {Integer} owner_uid The owner
 * @return {JSON} (Array with one element) An exchange incluing goods( owner_goods, other_goods )
 */
router.get('/of/user/one', (req, res) => {

	var _eid = parseInt(req.query.eid, 10);
	var _owner_uid = parseInt(req.query.owner_uid, 10);

	exchanges
		.findAll({
			where: {
				eid: _eid
			},
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
					where: {
						uid: _owner_uid
					},
					required: false
				}],
				where: {
					exchanged: 2,
					deleted: 0
				}
			}]
		})
		.then(result => {
			res.json(_(JSON.parse(JSON.stringify(result)))
				.map(r => {

					if (r['goods_one']['owner'] == null) {
						r['owner_goods'] = r['goods_two'];
						r['other_goods'] = r['goods_one'];
						r['owner_agree'] = r['goods_two_agree'];
						r['other_agree'] = r['goods_one_agree'];
					} else {
						r['owner_goods'] = r['goods_one'];
						r['other_goods'] = r['goods_two'];
						r['owner_agree'] = r['goods_one_agree'];
						r['other_agree'] = r['goods_two_agree'];
					}

					delete r['owner_goods']['owner'];
					delete r['other_goods']['owner'];
					delete r['goods_one'];
					delete r['goods_two'];
					delete r['goods_one_agree'];
					delete r['goods_two_agree'];

					return r;
				})
				.toArray());
		})
		.catch(err => {
			res.send({
				error: err
			});
		});
});

/**
 * Get an exchange simply by given eid
 *
 * @method GET api/exchange/
 * @param  {Integer} eid The ID of exchange
 * @return {JSON} An exchange incluing goods and owners
 */
router.get('/', (req, res) => {

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
					as: 'owner'
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
					as: 'owner'
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

/**
 * Create an exchange
 *
 * @method POST api/exchange/create
 * @param  {Integer} goods_one_gid One of goods in new exchange
 * @param  {Integer} goods_two_gid Other goods in new exchange
 * @return {JSON} If (goods_one, goods_two) pair exists return that one, or return new created exchange
 */
router.post('/create', (req, res) => {

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

/**
 * Drop an exchange
 *
 * @method PUT api/exchange/drop
 * @param  {Integer} eid The ID of an exchange
 * @return {JSON} Updated exchange object
 */
router.put('/drop', (req, res) => {

	var _eid = parseInt(req.body.eid, 10);

	exchanges
		.findOne({
			where: {
				eid: _eid
			}
		})
		.then(result => {
			result.status = 'dropped';
			result.save().then(() => {});
			return result;
		})
		.then(result => {

			result.getGoods_one().then(g1 => {
				g1.exchanged = 0;
				g1.save().then(() => {});
			});

			result.getGoods_two().then(g2 => {
				g2.exchanged = 0;
				g2.save().then(() => {});
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
});

/**
 * Accept an exchange by a user
 * And if two owners accept, then the exchange will be set status='completed'
 *
 * @method PUT api/exchange/agree
 * @param  {Integer} eid The ID of an exchange
 * @param  {Integer} owner_uid Who wants to accept this exchange
 * @return {JSON} Updated exchange object
 */
router.put('/agree', (req, res) => {

	var _eid = parseInt(req.body.eid, 10);
	var _owner_uid = parseInt(req.body.owner_uid, 10);

	exchanges
		.findOne({
			where: {
				eid: _eid
			},
			include: [{
				model: goods,
				as: 'goods_one',
				include: [{
					model: users,
					as: 'owner'
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
					as: 'owner'
				}],
				where: {
					exchanged: 2,
					deleted: 0
				}
			}]
		})
		.then(result => {
			if (result == null || result == undefined) {
				return result;
			}

			if (result['goods_one']['owner']['uid'] == _owner_uid) {
				result.goods_one_agree = true;
				result.save().then(() => {
					if (result.goods_one_agree == true && result.goods_two_agree == true) {
						result.status = 'completed';
						result.save().then(() => {});
					}
				});
			} else if (result['goods_two']['owner']['uid'] == _owner_uid) {
				result.goods_two_agree = true;
				result.save().then(() => {
					if (result.goods_one_agree == true && result.goods_two_agree == true) {
						result.status = 'completed';
						result.save().then(() => {});
					}
				});
			}
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

module.exports = router;
