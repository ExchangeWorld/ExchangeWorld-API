var Sequelize = require('sequelize');
var sequelize = require('../libs/sequelize');

// Define the schema of table `notifications`
var Notifications = sequelize.define('notifications', {
	nid: {
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
	// 	allowNull: false
	// },
	trigger_url: {
		type: Sequelize.STRING,
		allowNull: false
	},
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

module.exports = Notifications;
