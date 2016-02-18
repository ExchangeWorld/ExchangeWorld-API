'use strict';

var path = require('path');
var Sequelize = require('sequelize');
var sequelize = require(path.resolve(__dirname, '../libs/sequelize'));

/**
 * Define Messages schema
 * @param  {Sequelize.INTEGER} mid Message's ID
 * @param  {Sequelize.TEXT} content The content of the message
 * @param  {Sequelize.INTEGER} chatroom_cid The chatroom of this message
 * @param  {Sequelize.INTEGER} sender_uid Sender's uid
 */
var Messages = sequelize.define('messages', {
	mid: {
		type: Sequelize.INTEGER,
		allowNull: false,
		unique: true,
		autoIncrement: true,
		primaryKey: true
	},
	content: {
		type: Sequelize.TEXT,
		allowNull: false
	}
}, {
	indexes: [{
		unique: true,
		fields: ['mid'],
		method: 'BTREE'
	}, {
		fields: ['chatroom_cid'],
		method: 'BTREE'
	}, {
		fields: ['sender_uid'],
		method: 'BTREE'
	}]
});

// Other cols in relationships :
//
// chatroom_cid
// sender_uid

module.exports = Messages;
