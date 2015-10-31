var Sequelize = require('sequelize');
var sequelize = require('../libs/sequelize');

// Define the schema of table `goods`
var Goods = sequelize.define('goods', {
	gid: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		unique: true,
		autoIncrement: true,
		primaryKey: true
	},
	// owner_uid: {
	// 	type: Sequelize.INTEGER.UNSIGNED,
	// 	allowNull: false
	// },
	name: {
		type: Sequelize.STRING,
		allowNull: false
	},
	photo_path: {
		type: Sequelize.TEXT,
		allowNull: true
	},
	category: {
		type: Sequelize.STRING,
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
		defaultValue: 0,
	},
	// 0 means not exchanged yet, 1 means exchanged, 2 means exchanging
	exchanged: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 0
	},
	// 0 means not deleted yet, 1 means deleted
	deleted: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 0
	}
});

module.exports = Goods;
