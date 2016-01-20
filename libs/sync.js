'use strict';

var path = require('path');
var sequelize = require(path.resolve(__dirname, './sequelize'));
var set_relationships = require(path.resolve(__dirname, './relationships'));

set_relationships();

module.exports =
	sequelize
	.sync({
		force: false
	});
