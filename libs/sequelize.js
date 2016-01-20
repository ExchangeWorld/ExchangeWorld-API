'use strict';

var os = require('os');

var path = require('path');
var Sequelize = require('sequelize');

var dblogin = require(path.resolve(__dirname, './dblogin'));
var env = require(path.resolve(__dirname, './env'));

// Export a orm model with some config
var sequelize = new Sequelize('exchangeworld-v2', dblogin.ID, dblogin.password, {
	host: (env.NODE_ENV === 'production' ? 'localhost' : 'exwd.csie.org'),
	port: (env.NODE_ENV === 'production' ? 5432 : 45432),

	dialect: 'postgres',

	// We will use another async-logger soon
	logging: (env.NODE_ENV !== 'production' ? console.log : false),

	// maxConcurrentQueries: 200,

	// When server fired, check all the schema
	// BUT NOT while every visit
	// sync: { force: true },

	pool: {
		maxConnections: os.cpus().length / 2,
		minConnections: 1,
		maxIdleTime: 3000
	},

	define: {
		timestamps: true,
		deletedAt: false,
		freezeTableName: true,
		underscored: true,
		charset: 'utf8',
		collate: 'utf8_general_ci'
	}
});

module.exports = sequelize;
