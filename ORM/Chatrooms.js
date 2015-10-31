var Sequelize = require('sequelize');
var sequelize = require('../libs/sequelize');

// Define the schema of table `chatrooms`
var Chatrooms = sequelize.define('chatrooms', {
	cid: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		unique: true,
		autoIncrement: true,
		primaryKey: true
	},
	members: {
		type: Sequelize.TEXT,
		allowNull: true
	}
});

module.exports = Chatrooms;
