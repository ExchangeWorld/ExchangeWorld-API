'use strict';

var path = require('path');
var Sequelize = require('sequelize');
var sequelize = require(path.resolve(__dirname, '../libs/sequelize'));

/**
 * Define Chatrooms schema
 * @param  {Sequelize.INTEGER} cid Chatroom's ID
 * @param  {Sequelize.ARRAY(Sequelize.INTEGER)} members The members (user_uid) in this chatroom
 * @param  {Sequelize.ARRAY(Sequelize.INTEGER)} read_members The members (user_uid) that have read the last message
 * @param  {Sequelize.TEXT} last_message The last_message of this chatroom
 * @param  {Sequelize.DATE} last_message_time last_message updated time
 */
var Chatrooms = sequelize.define('chatrooms', {
	cid: {
		type: Sequelize.INTEGER,
		allowNull: false,
		unique: true,
		autoIncrement: true,
		primaryKey: true
	},
	members: {
		type: Sequelize.ARRAY(Sequelize.INTEGER),
		defaultValue: [],
		allowNull: false
	},
	read_members: {
		type: Sequelize.ARRAY(Sequelize.INTEGER),
		defaultValue: [],
		allowNull: false
	},
	last_message: {
		type: Sequelize.TEXT,
		defaultValue: '',
		allowNull: false
	},
	last_message_time: {
		type: Sequelize.DATE,
		defaultValue: Sequelize.NOW,
		allowNull: false
	}
}, {
	indexes: [{
		unique: true,
		fields: ['cid'],
		method: 'BTREE'
	}, {
		fields: ['members'],
		using: 'gin',
		operator: '_int4_ops'
	}, {
		fields: ['read_members'],
		using: 'gin',
		operator: '_int4_ops'
	}, {
		fields: ['last_message_time'],
		method: 'BTREE'
	}]
});

module.exports = Chatrooms;
