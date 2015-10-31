var Sequelize = require('sequelize');
var sequelize = require('../libs/sequelize');

// I am following 'following'
// Define the schema of table `followings`
var Followings = sequelize.define('followings', {
	fid: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		unique: true,
		autoIncrement: true,
		primaryKey: true
	},
	// my_uid: {
	// 	type: Sequelize.INTEGER.UNSIGNED,
	// 	allowNull: false
	// },
	// following_uid: {
	// 	type: Sequelize.INTEGER.UNSIGNED,
	// 	allowNull: false
	// }
});

module.exports = Followings;
