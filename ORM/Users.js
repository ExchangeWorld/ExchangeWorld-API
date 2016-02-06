'use strict';

var path = require('path');
var Sequelize = require('sequelize');
var sequelize = require(path.resolve(__dirname, '../libs/sequelize'));

/**
 * Define Users schema
 * @param  {Sequelize.BIGINT} uid User's ID
 * @param  {Sequelize.STRING} identity The user's identity
 * @param  {Sequelize.STRING} name The user's name
 * @param  {Sequelize.STRING} email The user's email
 * @param  {Sequelize.TEXT} photo_path The user's photo's path
 * @param  {Sequelize.TEXT} introduction The user's introduction
 * @param  {Sequelize.TEXT} wishlist The user's wish list
 */
var Users = sequelize.define('users', {
	uid: {
		type: Sequelize.BIGINT,
		allowNull: false,
		unique: true,
		autoIncrement: true,
		primaryKey: true
	},
	identity: {
		type: Sequelize.STRING,
		allowNull: false,
		unique: true
	},
	name: {
		type: Sequelize.STRING,
		allowNull: false
	},
	email: {
		type: Sequelize.STRING,
		allowNull: true
	},
	photo_path: {
		type: Sequelize.TEXT,
		allowNull: true
	},
	introduction: {
		type: Sequelize.TEXT,
		allowNull: true
	},
	wishlist: {
		type: Sequelize.TEXT,
		allowNull: true
	}
}, {
	indexes: [{
		unique: true,
		fields: ['uid'],
		method: 'BTREE'
	}, {
		unique: true,
		fields: ['identity'],
		method: 'BTREE'
	}, {
		fields: ['wishlist'],
		using: 'spgist',
		operator: 'text_ops'
	}]
});

module.exports = Users;
