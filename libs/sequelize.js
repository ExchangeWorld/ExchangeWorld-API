'use strict';

var Sequelize = require('sequelize');
var dblogin = require('./dblogin');

// Export a orm model with some config
var sequelize = new Sequelize('exchangeworld-test', dblogin.ID, dblogin.password, {
	host: 'exwd.csie.org',
	port: 45432,

	dialect: 'postgres',

	// We will use another async-logger soon
	logging: false,

	// maxConcurrentQueries: 200,

	// When server fired, check all the schema
	// BUT NOT while every visit
	// sync: { force: true },

	pool: {
		maxConnections: 16,
		minConnections: 4,
		maxIdleTime: 3000
	},

	define: {
		timestamps: true,
		createdAt: 'timestamp',
		updatedAt: false,
		deletedAt: false,
		freezeTableName: true,
		underscored: true,
		charset: 'utf8',
		collate: 'utf8_general_ci'
	}
});

module.exports = sequelize;
