var Sequelize = require('sequelize');
var sequelize = require('../libs/sequelize');

// Define the schema of table `users`
var Users = sequelize.define('users', {
	uid: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		unique: true,
		autoIncrement: true,
		primaryKey: true
	},
	identity: {
		type: Sequelize.STRING,
		allowNull: false,
		unique: true
	},
	name: {
		type: Sequelize.STRING,
		allowNull: false
	},
	email: {
		type: Sequelize.STRING,
		allowNull: true
	},
	photo_path: {
		type: Sequelize.TEXT,
		allowNull: true
	},
	introduction: {
		type: Sequelize.TEXT,
		allowNull: true
	},
	wishlist: {
		type: Sequelize.TEXT,
		allowNull: true
	}
});

module.exports = Users;
