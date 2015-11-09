var Sequelize = require('sequelize');
var sequelize = require('../libs/sequelize');

/**
 * Define Followings schema
 * I am following the 'following'
 * @param  {Sequelize.INTEGER.UNSIGNED} fid Following's ID
 * @param  {Sequelize.INTEGER.UNSIGNED} my_uid My uid
 * @param  {Sequelize.INTEGER.UNSIGNED} following_uid The uid of who I am following
 */
var Followings = sequelize.define('followings', {
	fid: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		unique: true,
		autoIncrement: true,
		primaryKey: true
	}
});

module.exports = Followings;
