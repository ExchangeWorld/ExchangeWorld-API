'use strict';

var path = require('path');
var Sequelize = require('sequelize');
var sequelize = require(path.resolve(__dirname, '../libs/sequelize'));

/**
* Define Notifications schema
* @param  {Sequelize.INTEGER} nid Notification's ID
* @param  {Sequelize.INTEGER} sender_uid Sender's uid
* @param  {Sequelize.INTEGER} receiver_uid Receiver's uid
* @param  {Sequelize.TEXT} trigger_url The URL of the notification trigger object
* @param  {Sequelize.TEXT} content The content of the notification
* @param  {Sequelize.BOOLEAN} unread If this notification is not read
 */
var Notifications = sequelize.define('notifications', {
	nid: {
		type: Sequelize.INTEGER,
		allowNull: false,
		unique: true,
		autoIncrement: true,
		primaryKey: true
	},
	trigger_url: {
		type: Sequelize.TEXT,
		allowNull: false
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
// sender_uid
// receiver_uid

module.exports = Notifications;
