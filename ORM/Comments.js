'use strict';

var path = require('path');
var Sequelize = require('sequelize');
var sequelize = require(path.resolve(__dirname, '../libs/sequelize'));

/**
 * Define Comments schema
 * @param  {Sequelize.INTEGER.UNSIGNED} cid Comment's ID
 * @param  {Sequelize.TEXT} content The content of comment
 * @param  {Sequelize.INTEGER.UNSIGNED} goods_gid The goods commented
 * @param  {Sequelize.INTEGER.UNSIGNED} commenter_uid The user who commented
 */
var Comments = sequelize.define('comments', {
	cid: {
		type: Sequelize.INTEGER.UNSIGNED,
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
		fields: ['cid'],
		method: 'BTREE'
	}, {
		fields: ['goods_gid'],
		method: 'BTREE'
	}, {
		fields: ['commenter_uid'],
		method: 'BTREE'
	}]
});

// Other cols in relationships :
//
// goods_gid
// commenter_uid

module.exports = Comments;
