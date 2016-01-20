'use strict';

var path = require('path');
var fs = require('fs');

var sequelize = require(path.resolve(__dirname, '../libs/sequelize'));
var queryTemplate =
	fs.readFileSync(path.resolve(__dirname, './exchanges_of_user_one.sql'), 'utf8')
	.replace(/\n/g, ' ')
	.replace(/\t/g, ' ');

module.exports = (_eid, _owner_uid, callback) => {
	sequelize
		.query(queryTemplate, {
			type: sequelize.QueryTypes.SELECT,
			nest: true,
			replacements: {
				eid: _eid,
				owner_uid: _owner_uid
			}
		})
		.then(result => {
			callback(result);
		});
};
