'use strict';

var path = require('path');
var Sequelize = require('sequelize');
var sequelize = require(path.resolve(__dirname, '../libs/sequelize'));

/**
 * Define Messages schema
 * @param  {Sequelize.BIGINT} mid Message's ID
 * @param  {Sequelize.BIGINT} chatroom_cid The chatroom of this message (0)
 * @param  {Sequelize.BIGINT} sender_uid Sender's uid
 * @param  {Sequelize.BIGINT} receiver_uid Receiver's uid
 * @param  {Sequelize.TEXT} content The content of the message
 * @param  {Sequelize.BOOLEAN} unread If this message is not read
 */
var Messages = sequelize.define('messages', {
	mid: {
		type: Sequelize.BIGINT,
		allowNull: false,
		unique: true,
		autoIncrement: true,
		primaryKey: true
	},
	content: {
		type: Sequelize.TEXT,
		allowNull: false
	},
	unread: {
		type: Sequelize.BOOLEAN,
		defaultValue: true,
		allowNull: false
	}
});

// Other cols in relationships :
//
// chatroom_cid
// sender_uid
// receiver_uid

module.exports = Messages;
