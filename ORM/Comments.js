var Sequelize = require('sequelize');
var sequelize = require('../libs/sequelize');

// Define the schema of table `comments`
var Comments = sequelize.define('comments', {
	cid: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		unique: true,
		autoIncrement: true,
		primaryKey: true
	},
	content: {
		type: Sequelize.TEXT,
		allowNull: false
	}
});

module.exports = Comments;
