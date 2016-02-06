'use strict';

var path = require('path');
var Sequelize = require('sequelize');
var sequelize = require(path.resolve(__dirname, '../libs/sequelize'));

/**
 * Define Follows schema
 * follower -[follow]-> followed
 * @param  {Sequelize.BIGINT} fid Follows' ID
 * @param  {Sequelize.BIGINT} follower_uid Follower's ID
 * @param  {Sequelize.BIGINT} followed_uid Followed's uid
 */
var Follows = sequelize.define('follows', {
	fid: {
		type: Sequelize.BIGINT,
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
