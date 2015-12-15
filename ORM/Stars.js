var Sequelize = require('sequelize');
var sequelize = require('../libs/sequelize');

/**
 * Define Stars schema
 * @param  {Sequelize.INTEGER.UNSIGNED} sid Star's ID
 * @param  {Sequelize.INTEGER.UNSIGNED} goods_gid The goods that is starred
 * @param  {Sequelize.INTEGER.UNSIGNED} starring_user_uid The user who star the goods
 */
var Stars = sequelize.define('stars', {
	sid: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		unique: true,
		autoIncrement: true,
		primaryKey: true
	}
}, {
	indexes: [{
		unique: true,
		fields: ['sid'],
		method: 'BTREE'
	}, {
		fields: ['goods_gid'],
		method: 'BTREE'
	}, {
		fields: ['starring_user_uid'],
		method: 'BTREE'
	}]
});

// Other cols in relationships :
//
// goods_gid
// starring_user_uid

module.exports = Stars;
