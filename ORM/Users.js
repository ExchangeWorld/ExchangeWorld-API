'use strict';

var path = require('path');
var Sequelize = require('sequelize');
var sequelize = require(path.resolve(__dirname, '../libs/sequelize'));

/**
 * Define Users schema
 * @param  {Sequelize.INTEGER} uid User's ID
 * @param  {Sequelize.STRING} identity The user's identity
 * @param  {Sequelize.STRING} name The user's name
 * @param  {Sequelize.STRING} email The user's email
 * @param  {Sequelize.TEXT} photo_path The user's photo's path
 * @param  {Sequelize.TEXT} introduction The user's introduction
 * @param  {Sequelize.ARRAY(Sequelize.TEXT)} wishlist The user's wish list
 * @param  {Sequelize.JSONB} extra_json extra information stored in jsonb
 */
var Users = sequelize.define('users', {
	uid: {
		type: Sequelize.INTEGER,
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
		type: Sequelize.ARRAY(Sequelize.TEXT),
		allowNull: true
	},
	extra_json: {
		type: Sequelize.JSONB,
		allowNull: false,
		defaultValue: {}
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
		using: 'gin',
		operator: '_text_ops'
	}, {
		fields: ['extra_json'],
		using: 'gin'
	}]
});

module.exports = Users;
