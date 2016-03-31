'use strict';

var path = require('path');
var fs = require('fs');

var redis = require(path.resolve(__dirname, '../../libs/redis'));

const TOKEN_EXPIRE_TIME = 604800;

var tokenCheck = (req, res, next) => {
	var _token = req.query.token || '';

	if (_token === '') {
		res.status(403).json({
			error: 'forbidden'
		});
	} else {
		redis.get(_token, (err, result) => {
			if (err) {
				res.status(500).json({
					error: err
				});
			} else if (result === null) {
				res.status(403).json({
					error: 'forbidden'
				});
			} else {
				redis.pipeline().set(_token, result).expire(_token, TOKEN_EXPIRE_TIME).exec((err, res) => {
					if (err) {
						res.status(500).json({
							error: err
						});
					} else {
						// EXWD middleware >w<
						req.exwd = {
							admin: true,
							anonymous: false,
							uid: parseInt(result, 10),
							registered: true
						};

						console.log('token', req.exwd);

						next();
					}
				});
			}
		});
	}
};

var loadingAdminList = (new Promise((res, rej) => {
	fs.readFile(path.resolve(__dirname, './admin.list'), 'utf8', (err, data) => {
		if (err) {
			rej(err);
		} else {
			res(data.split('\n').filter(c => c.length > 0).map(l => parseInt(l, 10)));
		}
	});
}));

module.exports = {
	tokenCheck: tokenCheck,
	loadingAdminList: loadingAdminList
};
