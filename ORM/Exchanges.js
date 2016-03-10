'use strict';

var path = require('path');
var Sequelize = require('sequelize');
var sequelize = require(path.resolve(__dirname, '../libs/sequelize'));

/**
 * Define Exchanges schema
 * @param  {Sequelize.INTEGER} eid Exchange's ID
 * @param  {Sequelize.INTEGER} goods_one_gid Smaller goods gid
 * @param  {Sequelize.INTEGER} goods_two_gid Larger goods gid
 * @param  {Sequelize.BOOLEAN} goods_one_agree Agreement of goods_one
 * @param  {Sequelize.BOOLEAN} goods_two_agree Agreement of goods_two
 * @param  {Sequelize.STRING} status The status of this exchange: 'initiated', 'dropped', 'completed'
 */
var Exchanges = sequelize.define('exchanges', {
	eid: {
		type: Sequelize.INTEGER,
		allowNull: false,
		unique: true,
		autoIncrement: true,
		primaryKey: true
	},
	goods_one_agree: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	},
	goods_two_agree: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	},
	status: {
		type: Sequelize.STRING,
		allowNull: false,
		defaultValue: 'initiated'
	}
}, {
	indexes: [{
		unique: true,
		fields: ['eid'],
		method: 'BTREE'
	}, {
		fields: ['goods_one_agree'],
		method: 'BTREE'
	}, {
		fields: ['goods_two_agree'],
		method: 'BTREE'
	}, {
		fields: ['goods_one_gid'],
		method: 'BTREE'
	}, {
		fields: ['goods_two_gid'],
		method: 'BTREE'
	}, {
		fields: ['status'],
		method: 'BTREE'
	}]
});

// Other cols in relationships :
//
// goods_one_gid
// goods_two_gid

module.exports = Exchanges;
