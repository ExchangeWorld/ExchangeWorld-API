var Sequelize = require('sequelize');
var sequelize = require('../libs/sequelize');

// host_goods_gid is which goods owns a queue
// queuer_goods_gid is which goods queues on host_goods

// Define the schema of table `queues`
var Queues = sequelize.define('queues', {
	qid: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		unique: true,
		autoIncrement: true,
		primaryKey: true
	},
	// host_goods_gid: {
	// 	type: Sequelize.INTEGER.UNSIGNED,
	// 	allowNull: false
	// },
	// queuer_goods_gid: {
	// 	type: Sequelize.INTEGER.UNSIGNED,
	// 	allowNull: false
	// }
});

module.exports = Queues;
