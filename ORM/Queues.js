'use strict';

var path = require('path');
var Sequelize = require('sequelize');
var sequelize = require(path.resolve(__dirname, '../libs/sequelize'));

/**
 * Define Queues schema
 * @param  {Sequelize.BIGINT} qid Queue's ID
 * @param  {Sequelize.BIGINT} host_goods_gid The goods that is queued on
 * @param  {Sequelize.BIGINT} queuer_goods_gid The goods that is queueing
 */
var Queues = sequelize.define('queues', {
	qid: {
		type: Sequelize.BIGINT,
		allowNull: false,
		unique: true,
		autoIncrement: true,
		primaryKey: true
	}
}, {
	indexes: [{
		unique: true,
		fields: ['qid'],
		method: 'BTREE'
	}, {
		fields: ['host_goods_gid'],
		method: 'BTREE'
	}, {
		fields: ['queuer_goods_gid'],
		method: 'BTREE'
	}]
});

// Other cols in relationships :
//
// host_goods_gid
// queuer_goods_gid

module.exports = Queues;
