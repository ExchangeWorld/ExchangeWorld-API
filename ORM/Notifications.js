'use strict';

var path = require('path');
var Sequelize = require('sequelize');
var sequelize = require(path.resolve(__dirname, '../libs/sequelize'));

/**
 * Define Notifications schema
 * @param  {Sequelize.INTEGER} nid Notification's ID
 * @param  {Sequelize.INTEGER} receiver_uid Receiver's uid
 * @param  {Sequelize.JSONB} json The notification itself
 * @param  {Sequelize.BOOLEAN} read If this notification is read
 */
var Notifications = sequelize.define('notifications', {
	nid: {
		type: Sequelize.INTEGER,
		allowNull: false,
		unique: true,
		autoIncrement: true,
		primaryKey: true
	},
	json: {
		type: Sequelize.JSONB,
		defaultValue: {},
		allowNull: false
	},
	read: {
		type: Sequelize.BOOLEAN,
		defaultValue: false,
		allowNull: false
	}
}, {
	indexes: [{
		unique: true,
		fields: ['nid'],
		method: 'BTREE'
	}, {
		fields: ['read'],
		method: 'BTREE'
	}, {
		fields: ['receiver_uid'],
		method: 'BTREE'
	}]
});

// Other cols in relationships :
//
// receiver_uid

module.exports = Notifications;
