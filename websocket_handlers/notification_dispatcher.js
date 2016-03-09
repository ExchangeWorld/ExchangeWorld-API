'use strict';

var path = require('path');

var comments = require(path.resolve(__dirname, '../ORM/Comments'));
var exchanges = require(path.resolve(__dirname, '../ORM/Exchanges'));
var follows = require(path.resolve(__dirname, '../ORM/Follows'));
var goods = require(path.resolve(__dirname, '../ORM/Goods'));
var queues = require(path.resolve(__dirname, '../ORM/Queues'));
var stars = require(path.resolve(__dirname, '../ORM/Stars'));
var users = require(path.resolve(__dirname, '../ORM/Users'));

var redis_sub = require(path.resolve(__dirname, '../libs/redis_sub'));

// There can be new comments, new exchanges, new follows, new goods, new queues, new stars.

var handleComments = msgObj => {
	return comments
		.findOne({
			where: {
				cid: msgObj.id
			},
			include: [{
				model: users,
				as: 'commenter',
				required: true,
				attributes: ['uid', 'name', 'photo_path']
			}, {
				model: goods,
				as: 'goods',
				where: {
					deleted: 0
				},
				required: true,
				attributes: ['gid', 'owner_uid', 'name', 'photo_path'],
				include: [{
					model: stars,
					as: 'star_goods',
					required: true
				}]
			}]
		})
		.then(result => {
			if (result) {
				var _tmp = [
					[result.goods.owner_uid, {
						codeType: 20001,
						payload: {
							comment: result.toJSON()
						}
					}]
				];

				_tmp = _tmp.concat(result.goods.star_goods.map(s => [s.starring_user_uid, {
					codeType: 20004,
					payload: {
						comment: result.toJSON()
					}
				}]));

				return _tmp;
			}

			return [];
		});
};

var handleExchanges = msgObj => {

};

var handleFollows = msgObj => {
	return follows
		.findOne({
			where: {
				fid: msgObj.id
			},
			include: [{
				model: users,
				as: 'follows_follower'
			}, {
				model: users,
				as: 'follows_followed'
			}]
		})
		.then(result => {
			if (result) {
				var _tmp = [
					[result.followed_uid, {
						codeType: 10004,
						payload: {
							person: (result.toJSON()).follows_follower
						}
					}]
				];

				// codeType: 10003 PENDING!
				return _tmp;
			}

			return [];
		});
};

var handleGoods = msgObj => {

};

var handleQueues = msgObj => {

};

var handleStars = msgObj => {

};

var modelHandlers = {
	comments: handleComments,
	exchanges: handleExchanges,
	follows: handleFollows,
	goods: handleGoods,
	queues: handleQueues,
	stars: handleStars
};

var subscribedMessageHandler = (channel, msg) => {
	if (channel === 'notifications') {
		var msgObj = JSON.parse(msg);
	} else {
		console.log(channel, 'is not subscribed ...');
	}
};

redis_sub.subscribe('notifications');
redis_sub.on('message', (channel, msg) => {
	if (channel === 'notifications') {
		return;
	}
});
