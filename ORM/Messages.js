var Sequelize = require('sequelize');
var sequelize = require('../libs/sequelize');

/**
 * Define Messages schema
 * @param  {Sequelize.INTEGER.UNSIGNED} mid Message's ID
 * @param  {Sequelize.INTEGER.UNSIGNED} chatroom_cid The chatroom of this message (0)
 * @param  {Sequelize.INTEGER.UNSIGNED} sender_uid Sender's uid
 * @param  {Sequelize.INTEGER.UNSIGNED} receiver_uid Receiver's uid
 * @param  {Sequelize.TEXT} content The content of the message
 * @param  {Sequelize.BOOLEAN} unread If this message is not read
 */
var Messages = sequelize.define('messages', {
	mid: {
		type: Sequelize.INTEGER.UNSIGNED,
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

module.exports = Messages;
