'use strict';

var path = require('path');
var Sequelize = require('sequelize');
var sequelize = require(path.resolve(__dirname, '../libs/sequelize'));

/**
 * Define Auths schema
 * @param  {Sequelize.INTEGER.UNSIGNED} aid Auth's ID
 * @param  {Sequelize.STRING} user_identity User's Identity
 * @param  {Sequelize.TEXT} salt Random generated salt
 * @param  {Sequelize.TEXT} answer Real password + salt = answer
 */
var Auths = sequelize.define('auths', {
	aid: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		unique: true,
		autoIncrement: true,
		primaryKey: true
	},
	user_identity: {
		type: Sequelize.STRING,
		unique: true,
		allowNull: false
	},
	salt: {
		type: Sequelize.TEXT,
		allowNull: false
	},
	answer: {
		type: Sequelize.TEXT,
		allowNull: false
	}
}, {
	indexes: [{
		unique: true,
		fields: ['aid'],
		method: 'BTREE'
	}, {
		unique: true,
		fields: ['user_identity'],
		method: 'BTREE'
	}, {
		unique: true,
		fields: ['user_uid'],
		method: 'BTREE'
	}]
});

// Other cols in relationships :
//
// user_uid

module.exports = Auths;
