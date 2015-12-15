var Sequelize = require('sequelize');
var sequelize = require('../libs/sequelize');

/**
 * Define Queues schema
 * @param  {Sequelize.INTEGER.UNSIGNED} qid Queue's ID
 * @param  {Sequelize.INTEGER.UNSIGNED} host_goods_gid The goods that is queued on
 * @param  {Sequelize.INTEGER.UNSIGNED} queuer_goods_gid The goods that is queueing
 */
var Queues = sequelize.define('queues', {
	qid: {
		type: Sequelize.INTEGER.UNSIGNED,
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
