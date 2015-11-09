var Sequelize = require('sequelize');
var sequelize = require('../libs/sequelize');

/**
 * Define Followers schema
 * The 'follower' is following me
 * @param  {Sequelize.INTEGER.UNSIGNED} fid Follower's ID
 * @param  {Sequelize.INTEGER.UNSIGNED} my_uid My uid
 * @param  {Sequelize.INTEGER.UNSIGNED} follower_uid The uid of who is following me
 */
var Followers = sequelize.define('followers', {
	fid: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		unique: true,
		autoIncrement: true,
		primaryKey: true
	}
});

module.exports = Followers;
