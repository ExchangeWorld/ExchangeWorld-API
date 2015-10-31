var Sequelize = require('sequelize');
var sequelize = require('../libs/sequelize');

// 'follower' is following me
// Define the schema of table `followers`
var Followers = sequelize.define('followers', {
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
	// follower_uid: {
	// 	type: Sequelize.INTEGER.UNSIGNED,
	// 	allowNull: false
	// }
});

module.exports = Followers;
