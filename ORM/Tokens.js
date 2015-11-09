var Sequelize = require('sequelize');
var sequelize = require('../libs/sequelize');

/**
 * Define Tokens schema
 * @param  {Sequelize.INTEGER.UNSIGNED} tid Token's ID
 * @param  {Sequelize.TEXT} token The content of the token
 */
var Tokens = sequelize.define('tokens', {
	tid: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		unique: true,
		autoIncrement: true,
		primaryKey: true
	},
	token: {
		type: Sequelize.TEXT,
		allowNull: false
	}
});

module.exports = Tokens;
