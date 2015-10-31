var Sequelize = require('sequelize');
var sequelize = require('../libs/sequelize');

// starring_user_uid is who star the goods

// Define the schema of table `stars`
var Stars = sequelize.define('stars', {
	sid: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		unique: true,
		autoIncrement: true,
		primaryKey: true
	},
	// goods_gid: {
	// 	type: Sequelize.INTEGER.UNSIGNED,
	// 	allowNull: false
	// },
	// starring_user_uid: {
	// 	type: Sequelize.INTEGER.UNSIGNED,
	// 	allowNull: false
	// }
});

module.exports = Stars;
