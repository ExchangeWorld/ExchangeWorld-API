var Sequelize = require('sequelize');
var sequelize = require('../libs/sequelize');

// Define the schema of table `auths`
var Auths = sequelize.define('auths', {
	aid: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		unique: true,
		autoIncrement: true,
		primaryKey: true
	},
	user_identity: {
		type: Sequelize.STRING,
		unique: true,
		allowNull: false
	},
	salt: {
		type: Sequelize.TEXT,
		allowNull: false
	},
	answer: {
		type: Sequelize.TEXT,
		allowNull: false
	}
});

module.exports = Auths;
