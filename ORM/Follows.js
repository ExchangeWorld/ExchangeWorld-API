var Sequelize = require('sequelize');
var sequelize = require('../libs/sequelize');

/**
 * Define Follows schema
 * follower -[follow]-> followed
 * @param  {Sequelize.INTEGER.UNSIGNED} fid Follows' ID
 * @param  {Sequelize.INTEGER.UNSIGNED} follower_uid Follower's ID
 * @param  {Sequelize.INTEGER.UNSIGNED} followed_uid Followed's uid
 */
var Follows = sequelize.define('follows', {
	fid: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		unique: true,
		autoIncrement: true,
		primaryKey: true
	}
}, {
	indexes: [{
		unique: true,
		fields: ['fid'],
		method: 'BTREE'
	}, {
		fields: ['followed_uid'],
		method: 'BTREE'
	}, {
		fields: ['follower_uid'],
		method: 'BTREE'
	}]
});

// Other cols in relationships :
//
// followed_uid
// follower_uid

module.exports = Follows;
