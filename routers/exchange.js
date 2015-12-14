/**
 * Provides some methods related to EXCHANGES
 *
 * @class Exchange
 */

'use strict';

var express = require('express');
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
	if (!req.exwd.admin) {
		res.send({
			error: 'Permission denied'
		});
		return;
	}

	exchanges
		.findAll({
			// where: {
			// 	status: 'initiated'
			// },
			include: [{
				model: goods,
				as: 'goods_one',
				include: [{
					model: users,
					as: 'owner'
				}],
				where: {
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
					deleted: 0
				}
			}],
			order: [
				['eid', 'DESC']
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
 * Get all exchanges of a user
 *
 * @method GET api/exchange/of/user/all
 * @param  {Integer} owner_uid The owner
 * @return {JSON} Exchanges incluing goods( owner_goods, other_goods )
 */
router.get('/of/user/all', (req, res) => {
	var _owner_uid;

	// REQ EXWD CHECK
	if (req.exwd.admin) {
		_owner_uid = parseInt(req.query.owner_uid, 10);
	} else if (req.exwd.anonymous) {
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

	exchanges
		.findAll({
			where: {
				status: {
					$ne: 'dropped'
				}
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
					attributes: ['uid', 'name', 'photo_path'],
					required: false
				}],
				where: {
					deleted: 0
				},
				attributes: ['gid', 'name', 'photo_path', 'category', 'exchanged']
			}, {
				model: goods,
				as: 'goods_two',
				include: [{
					model: users,
					as: 'owner',
					where: {
						uid: _owner_uid
					},
					attributes: ['uid', 'name', 'photo_path'],
					required: false
				}],
				where: {
					deleted: 0
				},
				attributes: ['gid', 'name', 'photo_path', 'category', 'exchanged']
			}],
			order: [
				['eid', 'DESC']
			]
		})
		.then(result => {
			console.log(result);
			result.forEach(r => console.log(r));

			res.json(_(JSON.parse(JSON.stringify(result)))
				.map(r => {
					if (r.goods_one.owner === null || r.goods_one.owner === undefined) {
						r.owner_goods = r.goods_two;
						r.other_goods = r.goods_one;
						r.owner_agree = r.goods_two_agree;
						r.other_agree = r.goods_one_agree;
					} else {
						r.owner_goods = r.goods_one;
						r.other_goods = r.goods_two;
						r.owner_agree = r.goods_one_agree;
						r.other_agree = r.goods_two_agree;
					}

					r.owner_goods.owner = undefined;
					r.other_goods.owner = undefined;
					r.goods_one = undefined;
					r.goods_two = undefined;
					r.goods_one_agree = undefined;
					r.goods_two_agree = undefined;

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
	var _owner_uid;

	// REQ EXWD CHECK
	if (req.exwd.admin) {
		_owner_uid = parseInt(req.query.owner_uid, 10);
	} else if (req.exwd.anonymous) {
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

	exchanges
		.findOne({
			where: {
				eid: _eid,
				status: {
					$ne: 'dropped'
				}
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
					attributes: ['uid', 'name', 'photo_path'],
					required: false
				}],
				where: {
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
					attributes: ['uid', 'name', 'photo_path'],
					required: false
				}],
				where: {
					deleted: 0
				}
			}]
		})
		.then(result => {
			console.log(result);

			res.json((result => {
				if (result.goods_one.owner === null || result.goods_one.owner === undefined) {
					result.owner_goods = result.goods_two;
					result.other_goods = result.goods_one;
					result.owner_agree = result.goods_two_agree;
					result.other_agree = result.goods_one_agree;
				} else {
					result.owner_goods = result.goods_one;
					result.other_goods = result.goods_two;
					result.owner_agree = result.goods_one_agree;
					result.other_agree = result.goods_two_agree;
				}

				result.owner_goods.owner = undefined;
				result.other_goods.owner = undefined;
				result.goods_one = undefined;
				result.goods_two = undefined;
				result.goods_one_agree = undefined;
				result.goods_two_agree = undefined;

				return result;
			})());
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

	// REQ EXWD CHECK
	if (!req.exwd.admin) {
		res.send({
			error: 'Permission denied'
		});
		return;
	}

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

	var _owner_uid;

	// REQ EXWD CHECK
	if (req.exwd.admin) {
		_owner_uid = null;
	} else if (req.exwd.anonymous) {
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

	var queryGoodsOneTmp = {
		where: {
			gid: _goods_one_gid,
			exchanged: 0,
			deleted: 0
		}
	};

	var queryGoodsTwoTmp = {
		where: {
			gid: _goods_two_gid,
			exchanged: 0,
			deleted: 0
		}
	};

	// Create instance
	// If there is already a pair (goods_one_gid, goods_two_gid) and the status is 'completed' then do nothing
	// If they want to re-start an exchange then the status dropped -> initiated
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
			if (isThereAlready) {
				if (isThereAlready.status === 'completed') {
					res.send({
						error: 'The exchange was completed before'
					});
				} else if (isThereAlready.status === 'dropped') {
					isThereAlready.status = 'initiated';
					isThereAlready
						.getGoods_one()
						.then(g1 => {
							isThereAlready
								.getGoods_two()
								.then(g2 => {
									if (g1.deleted === 0 && g2.deleted === 0 && g1.exchanged === 0 && g2.exchanged === 0) {
										g1.exchanged = 2;
										g2.exchanged = 2;
										g1.save().then(() => g2.save().then(() => isThereAlready.save().then(() => res.json(isThereAlready))));
									}
								});
						});

				} else {
					res.json(isThereAlready);
				}
			} else {
				// Check two goods' status
				goods
					.findOne(queryGoodsOneTmp)
					.then(g1 => {
						// If goods_one's status is ok
						if (g1) {
							goods
								.findOne(queryGoodsTwoTmp)
								.then(g2 => {
									// If goods_two's status is ok
									// And one of them is owner's goods
									// Or it's operated by admin
									if (g2 && (g1.owner_uid === _owner_uid || g2.owner_uid === _owner_uid || _owner_uid === null)) {
										g1.exchanged = 2;
										g2.exchanged = 2;
										g1.save();
										g2.save();

										chatrooms
											.create({
												members: ''
											})
											.then(the_chatroom => {
												exchanges
													.create({
														goods_one_gid: g1.gid,
														goods_two_gid: g2.gid,
														chatroom_cid: the_chatroom.cid
													})
													.then(the_exchange => {
														res.json(the_exchange);
													})
													.catch(err => {
														res.send({
															error: err
														});
													});
											})
											.catch(err => {
												res.send({
													error: err
												});
											});
									} else {
										res.send({
											error: 'The exchange cannot be created'
										});
									}
								});
						} else {
							res.send({
								error: 'The exchange cannot be created'
							});
						}
					})
					.catch(err => {
						res.send({
							error: err
						});
					});
			}
		})
		.catch(err => {
			res.send({
				error: err
			});
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
	var _owner_uid;

	// REQ EXWD CHECK
	if (req.exwd.admin) {
		_owner_uid = null;
	} else if (req.exwd.anonymous) {
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

	exchanges
		.findOne({
			where: {
				eid: _eid,
				status: 'initiated'
			}
		})
		.then(result => {
			if (result) {
				result.getGoods_one().then(g1 => {
					result.getGoods_two().then(g2 => {
						if (g1.owner_uid === _owner_uid || g2.owner_uid === _owner_uid || _owner_uid === null) {
							g1.exchanged = 0;
							g2.exchanged = 0;
							g1.save().then(() => g2.save().then(() => {
								result.status = 'dropped';
								result.save().then(() => res.json(result));
							}));
						} else {
							res.json(result);
						}
					});
				});
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
	var _owner_uid;

	// REQ EXWD CHECK
	if (req.exwd.admin) {
		_owner_uid = null;
	} else if (req.exwd.anonymous) {
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

	exchanges
		.findOne({
			where: {
				eid: _eid,
				status: 'initiated'
			}
		})
		.then(result => {
			if (result) {
				result.getGoods_one().then(g1 => {
					result.getGoods_two().then(g2 => {
						if (g1.owner_uid === _owner_uid || _owner_uid === null) {
							g1.exchanged = 3;
							g1.save().then(() => null);
						}
						if (g2.owner_uid === _owner_uid || _owner_uid === null) {
							g2.exchanged = 3;
							g2.save().then(() => null);
						}

						if (g1.exchanged === 3 && g2.exchanged === 3) {
							result.status = 'completed';
							g1.exchanged = 1;
							g2.exchanged = 1;
							g1.save().then(() => g2.save().then(() => result.save().then(() => res.json(result))));
						} else {
							res.json(result);
						}
					});
				});
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

module.exports = router;
