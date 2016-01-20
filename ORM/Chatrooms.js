'use strict';

var path = require('path');
var Sequelize = require('sequelize');
var sequelize = require(path.resolve(__dirname, '../libs/sequelize'));

/**
 * Define Chatrooms schema
 * @param  {Sequelize.INTEGER.UNSIGNED} cid Chatroom's ID
 * @param  {Sequelize.TEXT} members The members chatroom contains (in json)
 */
var Chatrooms = sequelize.define('chatrooms', {
	cid: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		unique: true,
		autoIncrement: true,
		primaryKey: true
	},
	members: {
		type: Sequelize.TEXT,
		defaultValue: '',
		allowNull: false
	}
});

module.exports = Chatrooms;
