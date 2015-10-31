var Sequelize = require('sequelize');
var sequelize = require('../libs/sequelize');

// Define the schema of table `exchanges`
var Exchanges = sequelize.define('exchanges', {
	eid: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		autoIncrement: true,
		primaryKey: true
	},
	// Smaller goods_gid puts here
	// goods_one_gid: {
	// 	type: Sequelize.INTEGER.UNSIGNED,
	// 	allowNull: false
	// },
	// Larger goods_gid puts here
	// goods_two_gid: {
	// 	type: Sequelize.INTEGER.UNSIGNED,
	// 	allowNull: false
	// },
	// Set agree or not for goods1
	goods_one_agree: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false,
	},
	// Set agree or not for goods2
	goods_two_agree: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false,
	},
	// Set exchange's chatroom
	// chatroom_cid: {
	// 	type: Sequelize.INTEGER.UNSIGNED,
	// 	allowNull: false,
	// 	unique: true,
	// },
	// 'initiated', 'dropped', 'completed'
	status: {
		type: Sequelize.STRING,
		allowNull: false,
		defaultValue: 'initiated'
	}
});

module.exports = Exchanges;
