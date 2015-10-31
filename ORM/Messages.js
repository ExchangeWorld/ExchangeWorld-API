var Sequelize = require('sequelize');
var sequelize = require('../libs/sequelize');

// Define the schema of table `messages`
var Messages = sequelize.define('messages', {
	mid: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		unique: true,
		autoIncrement: true,
		primaryKey: true
	},
	// sender_uid: {
	// 	type: Sequelize.INTEGER.UNSIGNED,
	// 	allowNull: false
	// },
	// receiver_uid: {
	// 	type: Sequelize.INTEGER.UNSIGNED,
	// 	defaultValue: 0,
	// 	allowNull: true
	// },
	content: {
		type: Sequelize.TEXT,
		allowNull: false
	},
	unread: {
		type: Sequelize.BOOLEAN,
		defaultValue: true,
		allowNull: false
	}
});

module.exports = Messages;
