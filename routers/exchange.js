var express   = require('express');
var Sequelize = require('sequelize');
var router    = express.Router();

// Including tables
var exchanges = require('../ORM/Exchanges');
var chatrooms = require('../ORM/Chatrooms') 
var users     = require('../ORM/Users');
var goods     = require('../ORM/Goods');

// These routes are really dangerous
// Only use them when you know what are you doing

router.get('/allExchange', function(req, res, next) {

	// Set association between tables (users, goods) 
	users.hasMany(goods, {foreignKey: 'owner_uid'});
	goods.belongsTo(users, {foreignKey: 'owner_uid'});
	
	exchanges.findAll({
			where: {
				status: 'initiated'
			}
		})
		.then(function(result) {
			res.json(result);
		})
		.catch(function(err) {
			res.send({
				error: err
			});
		});
});

router.get('/of', function(req, res, next) {

	var _owner_uid = parseInt(req.query.owner_uid, 10);

	goods
		.findAll({
			where: {
				owner_uid: _owner_uid,
				status: {
					$in: [0, 2]
				},
				deleted: 0
			}
		})
		.then(function(_goods) {
			var tmp_gids = _goods.map(function(g,i,arr){return g.gid});

			return exchanges.findAll({
				where: {
					$and: [{
						$or: [{
							goods1_gid: {
								$in: tmp_gids
							}
						}, {
							goods2_gid: {
								$in: tmp_gids
							}
						}]
					}, {
						status: 'initiated'
					}]
				}
			});
		})
		.then(function(result) {
			res.json(result);
		})
		.catch(function(err) {
			res.send({error: err});
		});
});

router.get('/ofn', function(req, res, next) {

	var _owner_uid = parseInt(req.query.owner_uid, 10);

	goods.belongsToMany(exchanges, {
		through: 'exchanges_goods'
	});

	exchanges.belongsToMany(goods, {
		through: 'exchanges_goods'
	});

	goods
		.findAll({
			where: {
				owner_uid: _owner_uid,
				status: 0,
				deleted: 0
			}
		})
		.then(function(_goods) {
			var tmp_gids = _goods.map(function(g, i, arr) {
				return g.gid
			});

			return exchanges.findAll({
				where: {
					$and: [{
						$or: [{
							goods1_gid: {
								$in: tmp_gids
							}
						}, {
							goods2_gid: {
								$in: tmp_gids
							}
						}]
					}, {
						status: 'initiated'
					}]
				},
				logging: true,
				// include: [{
				// 	as: 'goods1',
				// 	model: goods,
				// 	// where: {
				// 	// 	gid: Sequelize.col('exchanges.goods1_gid')
				// 	// },
				// 	// required: true
				// }, {
				// 	as: 'goods2',
				// 	model: goods,
				// 	// where: {
				// 	// 	gid: Sequelize.col('exchanges.goods2_gid')
				// 	// },
				// 	// required: true
				// }]
			});
		})
		.then(function(result) {
			res.json(result);
		})
		.catch(function(err) {
			res.send({
				error: err
			});
		});
});

router.get('/', function(req, res, next) {

	// Available query params
	// 
	// eid
	// 

	var _eid = parseInt(req.query.eid, 10);

	// Set association between tables (users, goods) 
	users.hasMany(goods, {foreignKey: 'owner_uid'});
	goods.belongsTo(users, {foreignKey: 'owner_uid'});

	exchanges.findAll({
			where: {
				eid: _eid,
				status: 'initiated'
			}
		})
		.then(function(result) {
			goods.findAll({
				where: {
					$or: [{
						gid: result[0].dataValues.goods1_gid
					}, {
						gid: result[0].dataValues.goods2_gid
					}]
				},
				include: [{
					model: users,
					required: true
				}]
			})
			.then(function(_goods) {
				// var __goods = _goods.map(function(gg,i,a){return gg.dataValues});
				result[0].dataValues.goods = _goods;
				return result;
			})
			.then(function(result) {
				res.json(result);
			})
			.catch(function(err) {
				res.json({error: err});
			});
		});
});

// Create a new exchange
// Default status of an exchange is 'initiated'
router.post('/create', function(req, res, next) {

	// Available POST body params:
	//
	// goods1_gid (smaller goods_gid)
	// goods2_gid (larger goods_gid)
	//

	// Get property:value in POST body
	var __goods1_gid = parseInt(req.body.goods1_gid, 10);
	var __goods2_gid = parseInt(req.body.goods2_gid, 10);

	// And make sure goods1_gid < goods2_gid
	var _goods1_gid = Math.min(__goods1_gid, __goods2_gid);
	var _goods2_gid = Math.max(__goods1_gid, __goods2_gid);

	// Create instance
	// If there is already a pair (goods1_gid, goods2_gid) then do nothing
	exchanges.findOne({
			where: {
				$and: [{
					goods1_gid: _goods1_gid
				}, {
					goods2_gid: _goods2_gid
				}]
			}
		})
		.then(function(isThereAlready) {
			if (isThereAlready != null) {
				res.json(isThereAlready);
			} else {
				chatrooms.create({
						members: ''
					})
					.then(function(the_chatroom) {
						return exchanges.create({
							goods1_gid: _goods1_gid,
							goods2_gid: _goods2_gid,
							chatroom_cid: the_chatroom.cid
						});
					})
					.then(function(result) {

						var _goods1_gid = result.goods1_gid;

						goods.findOne({
								where: {
									gid: _goods1_gid
								}
							})
							.then(function(_goods) {
								_goods.status = 2;
								_goods.save().then(function() {});
							});

						return result;
					})
					.then(function(result) {

						var _goods2_gid = result.goods2_gid;

						goods.findOne({
								where: {
									gid: _goods2_gid
								}
							})
							.then(function(_goods) {
								_goods.status = 2;
								_goods.save().then(function() {});
							});

						return result;
					})
					.then(function(result) {
						res.json(result);
					})
					.catch(function(err) {
						res.json({
							error: err
						});
					});
			}
		});
});

// Complete an exchagne
// Set the status of an exchange to completed
// And **WHEN COMPLETED** any other exchanges contain either goods1_gid or goods2_gid \
// Must become 'dropped'
router.put('/complete', function(req, res, next) {

	// Available PUT body params:
	//
	// goods1_gid (smaller goods_gid)
	// goods2_gid (larger goods_gid)
	//

	// Get property:value in PUT body
	var __goods1_gid = parseInt(req.body.goods1_gid, 10);
	var __goods2_gid = parseInt(req.body.goods2_gid, 10);

	// And make sure goods1_gid < goods2_gid
	var _goods1_gid = Math.min(__goods1_gid, __goods2_gid);
	var _goods2_gid = Math.max(__goods1_gid, __goods2_gid);

	// First, any exchanges with goods1_gid and goods2_gid, \
	// their status will be set to 'dropped'.
	// Find instance and update its status to 'completed' then save
	exchanges.update({
		status: 'dropped'
	}, {
		where: {
			$or: [{
				goods1_gid: _goods1_gid
			}, {
				goods2_gid: _goods2_gid
			}]
		}
	})
	.then(function(tmp) {
		return exchanges.findOne({
			where: {
				goods1_gid: _goods1_gid,
				goods2_gid: _goods2_gid
			}
		});
	})
	.then(function(result) {
		if (result == null) {
			return {};
		} else {
			if (result.goods1_agree == false || result.goods2_agree == false) {
				return {};
			}
			result.status = 'completed';
			result.save().then(function() {});
			return result;
		}
	})
	.then(function(result) {
		res.json(result);
		return result;
	}, function(err) {
		res.send({
			error: err
		});
	})
	.then(function(result) {
		if (result != {}) {
			goods.findOne({
					where: {
						gid: result.goods1_gid
					}
				})
				.then(function(goods1) {
					goods1.status = 1;
					goods1.save().then(function() {});
				})
		}
		return result;
	})
	.then(function(result) {
		if (result != {}) {
			goods.findOne({
					where: {
						gid: result.goods2_gid
					}
				})
				.then(function(goods2) {
					goods2.status = 1;
					goods2.save().then(function() {});
				})
		}
	});

});

// Drop an exchange
// Set the status of an exchange to dropped
router.put('/drop', function(req, res, next) {

	// Available PUT body params:
	//
	// goods1_gid (smaller goods_gid)
	// goods2_gid (larger goods_gid)
	//

	// Get property:value in PUT body
	var __goods1_gid = parseInt(req.body.goods1_gid, 10);
	var __goods2_gid = parseInt(req.body.goods2_gid, 10);

	// And make sure goods1_gid < goods2_gid
	var _goods1_gid = Math.min(__goods1_gid, __goods2_gid);
	var _goods2_gid = Math.max(__goods1_gid, __goods2_gid);

	// Find instance and update its status to 'dropped' then save
	exchanges.findOne({
			where: {
				$and: [{
					goods1_gid: _goods1_gid
				}, {
					goods2_gid: _goods2_gid
				}]
			}
		})
		.then(function(result) {
			if (result == null) {
				return {};
			} else {
				result.status = 'dropped';
				result.save().then(function() {});
				return result;
			}
		})
		.then(function(result) {
			res.json(result);
			return result;
		})
		.then(function(result) {
			if (result != {}) {
				goods.findOne({
						where: {
							gid: result.goods1_gid
						}
					})
					.then(function(goods1) {
						goods1.status = 0;
						goods1.save().then(function() {});
					})
			}
			return result;
		})
		.then(function(result) {
			if (result != {}) {
				goods.findOne({
						where: {
							gid: result.goods2_gid
						}
					})
					.then(function(goods2) {
						goods2.status = 0;
						goods2.save().then(function() {});
					})
			}
		})
		.catch(function(err) {
			res.json({
				error: err
			});
		});
});

// Change the agreement status of goods in the exchange
router.put('/agree', function(req, res, next) {

	// Available body params
	// 
	// eid
	// goods_gid
	// agree (true or false)
	//
	var _eid       = parseInt(req.body.eid, 10);
	var _goods_gid = parseInt(req.body.goods_gid, 10);
	var _agree     = (req.body.agree == 'true' || req.body.agree == true ? true : false);

	exchanges.findOne({
			where: {
				eid: _eid,
				status: 'initiated'
			}
		})
		.then(function(result) {
			if (result == null) {
				return {};
			} else {
				if (result.goods1_gid == _goods_gid) {
					result.goods1_agree = _agree;
					result.save().then(function() {});
					return result;
				} else if (result.goods2_gid == _goods_gid) {
					result.goods2_agree = _agree;
					result.save().then(function() {});
					return result;
				} else {
					return {};
				}
			}
		})
		.then(function(result) {
			res.json(result);
		})
		.catch(function(err) {
			res.send({
				error: err
			});
		});
});

module.exports = router;
