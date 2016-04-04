'use strict';

var path = require('path');

var Auths = require(path.resolve(__dirname, '../ORM/Auths'));
var Chatrooms = require(path.resolve(__dirname, '../ORM/Chatrooms'));
var Comments = require(path.resolve(__dirname, '../ORM/Comments'));
var Exchanges = require(path.resolve(__dirname, '../ORM/Exchanges'));
var Follows = require(path.resolve(__dirname, '../ORM/Follows'));
var Goods = require(path.resolve(__dirname, '../ORM/Goods'));
var Messages = require(path.resolve(__dirname, '../ORM/Messages'));
var Notifications = require(path.resolve(__dirname, '../ORM/Notifications'));
var Queues = require(path.resolve(__dirname, '../ORM/Queues'));
var Stars = require(path.resolve(__dirname, '../ORM/Stars'));
var Users = require(path.resolve(__dirname, '../ORM/Users'));

module.exports = () => {
	console.log('Setting Relationships ...');

	// Auths & Users
	Auths.belongsTo(Users, {
		as: 'user',
		foreignKey: 'user_uid'
	});
	Users.hasOne(Auths, {
		as: 'auth',
		foreignKey: 'user_uid',
		onDelete: 'cascade'
	});

	// Chatrooms & Messages
	Messages.belongsTo(Chatrooms, {
		as: 'chatroom',
		foreignKey: 'chatroom_cid'
	});
	Chatrooms.hasMany(Messages, {
		as: {
			plural: 'messages',
			singular: 'messages'
		},
		foreignKey: 'chatroom_cid',
		onDelete: 'cascade'
	});

	// Comments & Goods
	Comments.belongsTo(Goods, {
		as: 'goods',
		foreignKey: 'goods_gid'
	});
	Goods.hasMany(Comments, {
		as: {
			plural: 'comments',
			singular: 'comments'
		},
		foreignKey: 'goods_gid',
		onDelete: 'cascade'
	});

	// Comments & Users
	Comments.belongsTo(Users, {
		as: 'commenter',
		foreignKey: 'commenter_uid'
	});
	Users.hasMany(Comments, {
		as: {
			plural: 'comments',
			singular: 'comments'
		},
		foreignKey: 'commenter_uid',
		onDelete: 'cascade'
	});

	// Exchanges & Goods
	Exchanges.belongsTo(Goods, {
		as: 'goods_one',
		foreignKey: 'goods_one_gid'
	});
	Exchanges.belongsTo(Goods, {
		as: 'goods_two',
		foreignKey: 'goods_two_gid'
	});
	Goods.hasMany(Exchanges, {
		as: {
			plural: 'exchange_goods_one',
			singular: 'exchange_goods_one'
		},
		foreignKey: 'goods_one_gid',
		onDelete: 'cascade'
	});
	Goods.hasMany(Exchanges, {
		as: {
			plural: 'exchange_goods_two',
			singular: 'exchange_goods_two'
		},
		foreignKey: 'goods_two_gid',
		onDelete: 'cascade'
	});

	// Follows & Users
	// follower -[follow]-> followed
	Follows.belongsTo(Users, {
		as: 'followed',
		foreignKey: 'followed_uid'
	});
	Follows.belongsTo(Users, {
		as: 'follower',
		foreignKey: 'follower_uid'
	});
	Users.hasMany(Follows, {
		as: {
			plural: 'follows_followed',
			singular: 'follows_followed'
		},
		foreignKey: 'followed_uid',
		onDelete: 'cascade'
	});
	Users.hasMany(Follows, {
		as: {
			plural: 'follows_follower',
			singular: 'follows_follower'
		},
		foreignKey: 'follower_uid',
		onDelete: 'cascade'
	});

	// Goods & Users
	Goods.belongsTo(Users, {
		as: 'owner',
		foreignKey: 'owner_uid'
	});
	Users.hasMany(Goods, {
		as: {
			plural: 'goods',
			singular: 'goods'
		},
		foreignKey: 'owner_uid',
		onDelete: 'cascade'
	});

	// Messages & Users
	Messages.belongsTo(Users, {
		as: 'sender',
		foreignKey: 'sender_uid'
	});
	Users.hasMany(Messages, {
		as: {
			plural: 'messages_sender',
			singular: 'messages_sender'
		},
		foreignKey: 'sender_uid',
		onDelete: 'cascade'
	});

	// Notifications & Users
	Notifications.belongsTo(Users, {
		as: 'receiver',
		foreignKey: 'receiver_uid'
	});
	Users.hasMany(Notifications, {
		as: {
			plural: 'notifications_receiver',
			singular: 'notifications_receiver'
		},
		foreignKey: 'receiver_uid',
		onDelete: 'cascade'
	});

	// Queues & Goods
	Queues.belongsTo(Goods, {
		as: 'host_goods',
		foreignKey: 'host_goods_gid'
	});
	Queues.belongsTo(Goods, {
		as: 'queuer_goods',
		foreignKey: 'queuer_goods_gid'
	});
	Goods.hasMany(Queues, {
		as: {
			plural: 'queues_host_goods',
			singular: 'queues_host_goods'
		},
		foreignKey: 'host_goods_gid',
		onDelete: 'cascade'
	});
	Goods.hasMany(Queues, {
		as: {
			plural: 'queues_queuer_goods',
			singular: 'queues_queuer_goods'
		},
		foreignKey: 'queuer_goods_gid',
		onDelete: 'cascade'
	});

	// Stars & Goods
	Stars.belongsTo(Goods, {
		as: 'goods',
		foreignKey: 'goods_gid'
	});
	Goods.hasMany(Stars, {
		as: {
			plural: 'star_goods',
			singular: 'star_goods'
		},
		foreignKey: 'goods_gid',
		onDelete: 'cascade'
	});

	// Stars & Users
	Stars.belongsTo(Users, {
		as: 'starring_user',
		foreignKey: 'starring_user_uid'
	});
	Users.hasMany(Stars, {
		as: {
			plural: 'star_starring_user',
			singular: 'star_starring_user'
		},
		foreignKey: 'starring_user_uid',
		onDelete: 'cascade'
	});
};
