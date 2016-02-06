'use strict';

var path = require('path');
var Sequelize = require('sequelize');
var sequelize = require(path.resolve(__dirname, '../libs/sequelize'));

/**
 * Define Comments schema
 * @param  {Sequelize.BIGINT} cid Comment's ID
 * @param  {Sequelize.TEXT} content The content of comment
 * @param  {Sequelize.BIGINT} goods_gid The goods commented
 * @param  {Sequelize.BIGINT} commenter_uid The user who commented
 */
var Comments = sequelize.define('comments', {
	cid: {
		type: Sequelize.BIGINT,
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
