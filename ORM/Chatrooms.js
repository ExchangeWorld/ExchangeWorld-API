'use strict';

var path = require('path');
var Sequelize = require('sequelize');
var sequelize = require(path.resolve(__dirname, '../libs/sequelize'));

/**
 * Define Chatrooms schema
 * @param  {Sequelize.INTEGER} cid Chatroom's ID
 * @param  {Sequelize.ARRAY(Sequelize.INTEGER)} members The members (user_uid) in this chatroom
 * @param  {Sequelize.TEXT} last_message The last_message of this chatroom
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
	}]
});

module.exports = Chatrooms;
