'use strict';

var path = require('path');
var Sequelize = require('sequelize');
var sequelize = require(path.resolve(__dirname, '../libs/sequelize'));

/**
 * Define Goods schema
 * @param  {Sequelize.INTEGER.UNSIGNED} gid The goods' ID
 * @param  {Sequelize.INTEGER.UNSIGNED} owner_uid The owner's uid
 * @param  {Sequelize.TEXT} name The goods' name
 * @param  {Sequelize.TEXT} photo_path The goods' photo_paths (in json)
 * @param  {Sequelize.TEXT} category The category of the goods
 * @param  {Sequelize.TEXT} description The description of the goods
 * @param  {Sequelize.FLOAT} position_x The position_x of the goods
 * @param  {Sequelize.FLOAT} position_y The position_y of the goods
 * @param  {Sequelize.FLOAT} rate The rate of the goods
 * @param  {Sequelize.INTEGER} exchanged If the goods is exchanged: 0 means not exchanged yet, 1 means exchanged, 2 means exchanging
 * @param  {Sequelize.INTEGER} deleted If the goods is deleted: 0 means not deleted yet, 1 means deleted
 */
var Goods = sequelize.define('goods', {
	gid: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		unique: true,
		autoIncrement: true,
		primaryKey: true
	},
	name: {
		type: Sequelize.TEXT,
		allowNull: false
	},
	photo_path: {
		type: Sequelize.TEXT,
		allowNull: true
	},
	category: {
		type: Sequelize.TEXT,
		allowNull: false
	},
	description: {
		type: Sequelize.TEXT,
		allowNull: true
	},
	position_x: {
		type: Sequelize.FLOAT,
		allowNull: false,
		defaultValue: -1
	},
	position_y: {
		type: Sequelize.FLOAT,
		allowNull: false,
		defaultValue: -1
	},
	rate: {
		type: Sequelize.FLOAT,
		allowNull: true,
		defaultValue: 0
	},
	exchanged: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 0
	},
	deleted: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 0
	}
}, {
	indexes: [{
		unique: true,
		fields: ['gid'],
		method: 'BTREE'
	}, {
		fields: ['position_x'],
		method: 'BTREE'
	}, {
		fields: ['position_y'],
		method: 'BTREE'
	}, {
		fields: ['rate'],
		method: 'BTREE'
	}, {
		fields: ['exchanged'],
		method: 'BTREE'
	}, {
		fields: ['deleted'],
		method: 'BTREE'
	}, {
		fields: ['name'],
		using: 'spgist',
		operator: 'text_ops'
	}, {
		fields: ['category'],
		using: 'spgist',
		operator: 'text_ops'
	}, {
		fields: ['owner_uid'],
		method: 'BTREE'
	}]
});

// Other cols in relationships :
//
// owner_uid

module.exports = Goods;
