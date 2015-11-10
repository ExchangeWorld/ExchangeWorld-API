'use strict';

var Auths = require('../ORM/Auths');
var Chatrooms = require('../ORM/Chatrooms');
var Comments = require('../ORM/Comments');
var Exchanges = require('../ORM/Exchanges');
var Follows = require('../ORM/Follows');
var Goods = require('../ORM/Goods');
var Messages = require('../ORM/Messages');
var Notifications = require('../ORM/Notifications');
var Queues = require('../ORM/Queues');
var Stars = require('../ORM/Stars');
var Tokens = require('../ORM/Tokens');
var Users = require('../ORM/Users');

module.exports = () => {
	console.log('Setting Relationships ...');

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
		foreignKey: 'chatroom_cid'
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
		foreignKey: 'goods_gid'
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
		foreignKey: 'commenter_uid'
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
		as: 'exchange_goods_one',
		foreignKey: 'goods_one_gid'
	});
	Goods.hasMany(Exchanges, {
		as: 'exchange_goods_two',
		foreignKey: 'goods_two_gid'
	});

	// Exchange & Chatrooms
	Exchanges.belongsTo(Chatrooms, {
		as: 'chatroom',
		foreignKey: 'chatroom_cid'
	});
	Chatrooms.hasOne(Exchanges, {
		as: 'exchange',
		foreignKey: 'chatroom_cid'
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
		as: 'follows_followed',
		foreignKey: 'followed_uid'
	});
	Users.hasMany(Follows, {
		as: 'follows_follower',
		foreignKey: 'follower_uid'
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
		foreignKey: 'owner_uid'
	});

	// Messages & Users
	Messages.belongsTo(Users, {
		as: 'sender',
		foreignKey: 'sender_uid'
	});
	Messages.belongsTo(Users, {
		as: 'receiver',
		foreignKey: 'receiver_uid'
	});
	Users.hasMany(Messages, {
		as: 'messages_sender',
		foreignKey: 'sender_uid'
	});
	Users.hasMany(Messages, {
		as: 'messages_receiver',
		foreignKey: 'receiver_uid'
	});

	// Notifications & Users
	Notifications.belongsTo(Users, {
		as: 'sender',
		foreignKey: 'sender_uid'
	});
	Notifications.belongsTo(Users, {
		as: 'receiver',
		foreignKey: 'receiver_uid'
	});
	Users.hasMany(Notifications, {
		as: 'notifications_sender',
		foreignKey: 'sender_uid'
	});
	Users.hasMany(Notifications, {
		as: 'notifications_receiver',
		foreignKey: 'receiver_uid'
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
		as: 'queues_host_goods',
		foreignKey: 'host_goods_gid'
	});
	Goods.hasMany(Queues, {
		as: 'queues_queuer_goods',
		foreignKey: 'queuer_goods_gid'
	});

	// Stars & Goods
	Stars.belongsTo(Goods, {
		as: 'goods',
		foreignKey: 'goods_gid'
	});
	Goods.hasMany(Stars, {
		as: 'star_goods',
		foreignKey: 'goods_gid'
	});

	// Stars & Users
	Stars.belongsTo(Users, {
		as: 'starring_user',
		foreignKey: 'starring_user_uid'
	});
	Users.hasMany(Stars, {
		as: 'star_starring_user',
		foreignKey: 'starring_user_uid'
	});
};
