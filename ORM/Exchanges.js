var Sequelize = require('sequelize');
var sequelize = require('../libs/sequelize');

/**
 * Define Exchanges schema
 * @param  {Sequelize.INTEGER.UNSIGNED} eid Exchange's ID
 * @param  {Sequelize.INTEGER.UNSIGNED} goods_one_gid Smaller goods gid
 * @param  {Sequelize.INTEGER.UNSIGNED} goods_two_gid Larger goods gid
 * @param  {Sequelize.BOOLEAN} goods_one_agree Agreement of goods_one
 * @param  {Sequelize.BOOLEAN} goods_two_agree Agreement of goods_two
 * @param  {Sequelize.INTEGER.UNSIGNED} chatroom_cid The chatroom id for this exchange
 * @param  {Sequelize.STRING} status The status of this exchange: 'initiated', 'dropped', 'completed'
 */
var Exchanges = sequelize.define('exchanges', {
	eid: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		autoIncrement: true,
		primaryKey: true
	},
	goods_one_agree: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	},
	goods_two_agree: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	},
	status: {
		type: Sequelize.STRING,
		allowNull: false,
		defaultValue: 'initiated'
	}
});

module.exports = Exchanges;
