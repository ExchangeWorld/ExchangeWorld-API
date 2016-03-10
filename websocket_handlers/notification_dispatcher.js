'use strict';

var path = require('path');

var comments = require(path.resolve(__dirname, '../ORM/Comments'));
var exchanges = require(path.resolve(__dirname, '../ORM/Exchanges'));
var follows = require(path.resolve(__dirname, '../ORM/Follows'));
var goods = require(path.resolve(__dirname, '../ORM/Goods'));
var notifications = require(path.resolve(__dirname, '../ORM/Notifications'));
var queues = require(path.resolve(__dirname, '../ORM/Queues'));
var stars = require(path.resolve(__dirname, '../ORM/Stars'));
var users = require(path.resolve(__dirname, '../ORM/Users'));

// There can be new comments, new exchanges, new follows, new goods, new queues, new stars.

// msgObj looks like:
// {
// 	model: ,
// 	id: ,
// 	whoNeedsNotification: (exchanges only)
// 	situation: (exchanges only)
// }

// 當新的 comment 產生的時候
// 20001 為 物品主人被推播
// 20004 為 關注物品的人們被推播
var handleComments = msgObj => {
	return comments
		.findOne({
			where: {
				cid: msgObj.id
			},
			include: [{
				model: users,
				as: 'commenter',
				attributes: ['uid', 'name', 'photo_path']
			}, {
				model: goods,
				as: 'goods',
				attributes: ['gid', 'owner_uid', 'name', 'photo_path'],
				include: [{
					model: stars,
					as: 'star_goods'
				}]
			}]
		})
		.then(result => {
			if (result) {
				var _result_json = result.toJSON();

				var _tmp = [
					[result.goods.owner_uid, {
						codeType: 20001,
						payload: {
							goods: _result_json.goods,
							comment: _result_json
						}
					}]
				];

				_tmp = _tmp.concat(result.goods.star_goods.map(s => [s.starring_user_uid, {
					codeType: 20004,
					payload: {
						goods: _result_json.goods,
						comment: _result_json
					}
				}]));

				return _tmp;
			}

			return [];
		});
};

// 當新的 exchange 產生的時候，或者完成、被放棄的時候
// 30001 為 被接受排的人被推播
// 30002 (pending) 為 有人放棄了 exchange 的時候
// 30003 (pending) 為 exchange 被完成的時候
var handleExchanges = msgObj => {
	// msgObj.whoNeedsNotification

	return exchanges
		.findOne({
			where: {
				eid: msgObj.id
			},
			include: [{
				model: goods,
				as: 'goods_one'
			}, {
				model: goods,
				as: 'goods_two'
			}]
		})
		.then(result => {
			if (result) {
				var _tmp = [
					[msgObj.whoNeedsNotification, {
						codeType: 30001,
						payload: {
							exchange: result.toJSON()
						}
					}]
				];

				// codeType: 30002 PENDING!
				// codeType: 30003 PENDING!

				return _tmp;
			}

			return [];
		});
};

// 當新的 follow 產生的時候
// 10003 (pending)
// 10004 為 被追隨的人被推播
var handleFollows = msgObj => {
	return follows
		.findOne({
			where: {
				fid: msgObj.id
			},
			include: [{
				model: users,
				as: 'follower'
			}, {
				model: users,
				as: 'followed'
			}]
		})
		.then(result => {
			if (result) {
				var _tmp = [
					[result.followed_uid, {
						codeType: 10004,
						payload: {
							person: (result.toJSON()).follower
						}
					}]
				];

				// codeType: 10003 PENDING!
				return _tmp;
			}

			return [];
		});
};

// 當新的 goods 產生的時候
// 10001 為 追隨這個物品主人的人們被推播
// 10002 (pending)
var handleGoods = msgObj => {
	return goods
		.findOne({
			where: {
				gid: msgObj.id
			},
			include: [{
				model: users,
				as: 'owner',
				include: [{
					model: follows,
					as: 'follows_follower'
				}, {
					model: follows,
					as: 'follows_followed'
				}]
			}]
		})
		.then(result => {
			var _tmp = [];

			_tmp = _tmp.concat(result.owner.follows_followed.map(f => [f.follower_uid, {
				codeType: 10001,
				payload: {
					goods: result.toJSON()
				}
			}]));

			// codeType: 10002 PENDING!
			return _tmp;
		});
};

// 當新的 queue 產生的時候
// 20002 為 被排的物品的主人被推播
var handleQueues = msgObj => {
	return queues
		.findOne({
			where: {
				qid: msgObj.id
			},
			include: [{
				model: goods,
				as: 'host_goods'
			}, {
				model: goods,
				as: 'queuer_goods'
			}]
		})
		.then(result => {
			var _tmp = [
				[result.host_goods.owner_uid, {
					codeType: 20002,
					payload: {
						queue: result.toJSON()
					}
				}]
			];

			return _tmp;
		});
};

// 當新的 star 產生的時候
// 20003 為 被關注的物品的主人被推播
var handleStars = msgObj => {
	return stars
		.findOne({
			where: {
				sid: msgObj.id
			},
			include: [{
				model: goods,
				as: 'goods'
			}, {
				model: users,
				as: 'starring_user'
			}]
		})
		.then(result => {
			var _tmp = [
				[result.goods.owner_uid, {
					codeType: 20003,
					payload: {
						person: (result.toJSON()).starring_user
					}
				}]
			];

			return _tmp;
		});
};

var modelHandlers = {
	comments: handleComments,
	exchanges: handleExchanges,
	follows: handleFollows,
	goods: handleGoods,
	queues: handleQueues,
	stars: handleStars
};

var subscribedMessageHandler = msg => {
	var msgObj = JSON.parse(msg);

	return (modelHandlers[msgObj.model](msgObj))
		.then(pushingTargetsAndPayloads => {
			if (pushingTargetsAndPayloads.length > 0) {
				var _tmp = pushingTargetsAndPayloads
					.map(_arr => ({
						receiver_uid: _arr[0],
						body: _arr[1]
					}));

				return notifications
					.bulkCreate(_tmp)
					.then(() => {
						return pushingTargetsAndPayloads;
					});
			}

			return pushingTargetsAndPayloads;
		});
};

module.exports = subscribedMessageHandler;
