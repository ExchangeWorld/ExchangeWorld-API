/**
 * Provides some methods related to EXCHANGES
 *
 * @class Exchange
 */

'use strict';

var path = require('path');

var express = require('express');
var router = express.Router();

// Including tables
var exchanges = require(path.resolve(__dirname, '../ORM/Exchanges'));
var chatrooms = require(path.resolve(__dirname, '../ORM/Chatrooms'));
var users = require(path.resolve(__dirname, '../ORM/Users'));
var goods = require(path.resolve(__dirname, '../ORM/Goods'));

// Including special handmade queries
var exchanges_of_user_all = require(path.resolve(__dirname, '../queries/exchanges_of_user_all'));
var exchanges_of_user_one = require(path.resolve(__dirname, '../queries/exchanges_of_user_one'));

/**
 * Get all of exchanges
 *
 * @method GET api/exchange/all
 * @return {JSON} Exchanges including goods and owners
 */
router.get('/all', (req, res) => {
	if (!req.exwd.admin) {
		res.status(403).json({
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
			res.status(200).json(result);
		})
		.catch(err => {
			res.status(500).json({
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
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		_owner_uid = req.exwd.uid;
	} else {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	}

	exchanges_of_user_all(_owner_uid, (result => res.status(200).json(result.map(r => {
		if (r.goods_one.owner.uid === _owner_uid) {
			r.owner_goods = r.goods_one;
			r.other_goods = r.goods_two;
			r.owner_agree = r.goods_one_agree;
			r.other_agree = r.goods_two_agree;
		} else {
			r.owner_goods = r.goods_two;
			r.other_goods = r.goods_one;
			r.owner_agree = r.goods_two_agree;
			r.other_agree = r.goods_one_agree;
		}

		r.goods_one = undefined;
		r.goods_two = undefined;
		r.goods_one_agree = undefined;
		r.goods_two_agree = undefined;

		return r;
	}))));
});

/**
 * Get an exchanges of a user
 *
 * @method GET api/exchange/of/user/one
 * @param  {Integer} eid The ID of the exchange
 * @param  {Integer} owner_uid The owner
 * @return {JSON} An exchange object including goods( owner_goods, other_goods )
 */
router.get('/of/user/one', (req, res) => {
	var _eid = parseInt(req.query.eid, 10);
	var _owner_uid;

	// REQ EXWD CHECK
	if (req.exwd.admin) {
		_owner_uid = parseInt(req.query.owner_uid, 10);
	} else if (req.exwd.anonymous) {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		_owner_uid = req.exwd.uid;
	} else {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	}

	exchanges_of_user_one(_eid, _owner_uid, r => {
		if (r.length > 0) {
			if (r[0].goods_one.owner.uid === _owner_uid) {
				r[0].owner_goods = r[0].goods_one;
				r[0].other_goods = r[0].goods_two;
				r[0].owner_agree = r[0].goods_one_agree;
				r[0].other_agree = r[0].goods_two_agree;
			} else {
				r[0].owner_goods = r[0].goods_two;
				r[0].other_goods = r[0].goods_one;
				r[0].owner_agree = r[0].goods_two_agree;
				r[0].other_agree = r[0].goods_one_agree;
			}

			r[0].goods_one = undefined;
			r[0].goods_two = undefined;
			r[0].goods_one_agree = undefined;
			r[0].goods_two_agree = undefined;

			res.status(200).json(r[0]);
		} else {
			res.status(404).json(null);
		}
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
		res.status(403).json({
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
			res.status(200).json(result);
		})
		.catch(err => {
			res.status(500).json({
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
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		_owner_uid = req.exwd.uid;
	} else {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	}

	if ((!_goods_one_gid) || (!_goods_two_gid) || (!_owner_uid)) {
		res.status(400).json({
			error: 'goods_one and _two are wrong'
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
					res.status(403).json({
						error: 'The exchange was completed before'
					});
				} else if (isThereAlready.status === 'dropped') {
					isThereAlready.getGoods_one().then(g1 => {
						isThereAlready.getGoods_two().then(g2 => {
							if (g1.deleted === 0 && g2.deleted === 0 && g1.exchanged === 0 && g2.exchanged === 0) {
								g1.exchanged = 2;
								g2.exchanged = 2;
								isThereAlready.status = 'initiated';
								isThereAlready.goods_one_agree = false;
								isThereAlready.goods_two_agree = false;
								g1.save().then(() => g2.save().then(() => isThereAlready.save().then(() => res.status(200).json(isThereAlready))));
							} else {
								res.status(403).json({
									error: 'The exchange cannot be created, one of goods is not available'
								});
							}
						});
					});
				} else {
					res.status(200).json(isThereAlready);
				}
			} else {
				// Check two goods' status
				goods.findOne(queryGoodsOneTmp).then(g1 => {
						// If goods_one's status is ok
						if (g1) {
							goods.findOne(queryGoodsTwoTmp).then(g2 => {
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
											members: []
										})
										.then(the_chatroom => {
											exchanges
												.create({
													goods_one_gid: g1.gid,
													goods_two_gid: g2.gid,
													chatroom_cid: the_chatroom.cid
												})
												.then(the_exchange => {
													res.status(201).json(the_exchange);
												})
												.catch(err => {
													console.log(err);
													res.status(500).json({
														error: err
													});
												});
										})
										.catch(err => {
											console.log(err);
											res.status(500).json({
												error: err
											});
										});
								} else {
									res.status(403).json({
										error: 'The exchange cannot be created'
									});
								}
							});
						} else {
							res.status(403).json({
								error: 'The exchange cannot be created'
							});
						}
					})
					.catch(err => {
						console.log(err);
						res.status(500).json({
							error: err
						});
					});
			}
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({
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
	if (!_eid) {
		_eid = parseInt(req.query.eid, 10);
	}
	var _owner_uid;

	// REQ EXWD CHECK
	if (req.exwd.admin) {
		_owner_uid = null;
	} else if (req.exwd.anonymous) {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		_owner_uid = req.exwd.uid;
	} else {
		res.status(403).json({
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
							result.status = 'dropped';
							result.goods_one_agree = false;
							result.goods_two_agree = false;
							g1.save().then(() => g2.save().then(() => {
								result.save().then(() => res.status(200).json(result));
							}));
						} else {
							res.status(403).json({
								error: 'Permission denied'
							});
						}
					});
				});
			} else {
				res.status(404).json(result);
			}
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
});

/**
 * Accept an exchange by a user
 * And if two owners accept, then the exchange will be set status='completed'
 * When completed, other exchanges include goods_one or goods_two will be set to status='dropped'
 * And the goods that not goods_one or goods_two in the exchange will be set to exchanged=0
 *
 * @method PUT api/exchange/agree
 * @param  {Integer} eid The ID of an exchange
 * @param  {Integer} owner_uid Who wants to accept this exchange
 * @return {JSON} Updated exchange object
 */
router.put('/agree', (req, res) => {
	var _eid = parseInt(req.body.eid, 10);
	if (!_eid) {
		_eid = parseInt(req.query.eid, 10);
	}
	var _owner_uid;

	// REQ EXWD CHECK
	if (req.exwd.admin) {
		_owner_uid = null;
	} else if (req.exwd.anonymous) {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	} else if (req.exwd.registered) {
		_owner_uid = req.exwd.uid;
	} else {
		res.status(403).json({
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
							result.goods_one_agree = true;
						}
						if (g2.owner_uid === _owner_uid || _owner_uid === null) {
							result.goods_two_agree = true;
						}

						result.save().then(() => {
							if (result.goods_one_agree && result.goods_two_agree) {
								result.status = 'completed';
								g1.exchanged = 1;
								g2.exchanged = 1;
								g1.save().then(() => g2.save().then(() => result.save().then(() => {
									// Other exchanges that contain goods_one or goods_two will be setted to 'dropped'
									exchanges
										.findAll({
											where: {
												$or: [{
													$or: [{
														goods_one_gid: g1.gid
													}, {
														goods_one_gid: g2.gid
													}]
												}, {
													$or: [{
														goods_two_gid: g1.gid
													}, {
														goods_two_gid: g2.gid
													}]
												}],
												eid: {
													$ne: _eid
												}
											}
										})
										.then(other_exchange => {
											if (other_exchange.length > 0) {
												var other_gids = other_exchange
													.map(oe => {
														var tmpOeGid = 0;

														if (oe.goods_one_gid === g1.gid || oe.goods_one_gid === g2.gid) {
															tmpOeGid = oe.goods_two_gid;
														} else if (oe.goods_two_gid === g1.gid || oe.goods_two_gid === g2.gid) {
															tmpOeGid = oe.goods_one_gid;
														}

														return tmpOeGid;
													});

												// console.log('other_gids', other_gids);

												goods
													.update({
														exchanged: 0
													}, {
														where: {
															gid: {
																$in: other_gids
															},
															exchanged: {
																$ne: 1
															}
														}
													})
													.then(uuu => res.status(200).json(result))
													.catch(err => {
														console.log(err);
														res.status(500).json({
															error: err
														});
													});
											} else {
												res.status(200).json(result);
											}
										})
										.catch(err => {
											console.log(err);
											res.status(500).json({
												error: err
											});
										});
								})));
							} else {
								res.status(200).json(result);
							}
						});
					});
				});
			} else {
				res.status(404).json(result);
			}
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
});

module.exports = router;
