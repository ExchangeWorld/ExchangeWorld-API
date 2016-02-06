'use strict';

var path = require('path');
var Sequelize = require('sequelize');
var sequelize = require(path.resolve(__dirname, '../libs/sequelize'));

/**
 * Define Stars schema
 * @param  {Sequelize.BIGINT} sid Star's ID
 * @param  {Sequelize.BIGINT} goods_gid The goods that is starred
 * @param  {Sequelize.BIGINT} starring_user_uid The user who star the goods
 */
var Stars = sequelize.define('stars', {
	sid: {
		type: Sequelize.BIGINT,
		allowNull: false,
		unique: true,
		autoIncrement: true,
		primaryKey: true
	}
}, {
	indexes: [{
		unique: true,
		fields: ['sid'],
		method: 'BTREE'
	}, {
		fields: ['goods_gid'],
		method: 'BTREE'
	}, {
		fields: ['starring_user_uid'],
		method: 'BTREE'
	}]
});

// Other cols in relationships :
//
// goods_gid
// starring_user_uid

module.exports = Stars;
