'use strict';

var sequelize = require('./sequelize');
var set_relationships = require('./relationships');

set_relationships();

module.exports =
	sequelize
	.sync({
		force: false
	});
