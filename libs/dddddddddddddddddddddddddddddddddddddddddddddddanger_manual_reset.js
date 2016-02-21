'use strict';

var path = require('path');
var sequelize = require(path.resolve(__dirname, './sequelize'));
var set_relationships = require(path.resolve(__dirname, './relationships'));

set_relationships();

sequelize
	.sync({
		force: true
	})
	.then(() => {
		console.log('Done.');
		process.exit(0);
	});
