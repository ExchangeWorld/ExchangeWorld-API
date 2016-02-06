'use strict';

var path = require('path');
var Sequelize = require('sequelize');
var sequelize = require(path.resolve(__dirname, '../libs/sequelize'));

/**
 * Define Chatrooms schema
 * @param  {Sequelize.BIGINT} cid Chatroom's ID
 * @param  {Sequelize.ARRAY(Sequelize.BIGINT)} members The members (user_uid) in this chatroom
 * @param  {Sequelize.TEXT} last_message The last_message of this chatroom
 */
var Chatrooms = sequelize.define('chatrooms', {
	cid: {
		type: Sequelize.BIGINT,
		allowNull: false,
		unique: true,
		autoIncrement: true,
		primaryKey: true
	},
	members: {
		type: Sequelize.ARRAY(Sequelize.BIGINT),
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
		operator: '_int8_ops'
	}]
});

module.exports = Chatrooms;
