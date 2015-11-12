'use strict';

var http = require('http');
var querystring = require('querystring');

var generalJob = (_path, method, query, body, callback) => {

	console.log(method, _path);

	query = querystring.stringify(query);
	var postData = querystring.stringify(body);

	var options = {
		port: 3000,
		method: method,
		path: _path
	};

	if (query != '') {
		options.path += '?' + query;
	}

	if ((method == 'POST' || method == 'PUT') && postData != '') {
		options.headers = {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': postData.length
		};
	}

	// console.log('Options', options);

	var req = http.request(options, res => {
		// console.log('STATUS: ' + res.statusCode);
		// console.log('HEADERS: ' + JSON.stringify(res.headers));
		res.setEncoding('utf8');

		var chunk = '';

		res.on('data', _chunk => {
			// console.log('--');
			// console.log('Received', _chunk);
			// console.log('--');
			chunk += _chunk;
		});

		res.on('end', () => {
			// console.log('No more data in response.');
			// console.log('\t :=>', JSON.parse(chunk));
			callback(null, JSON.parse(chunk));
		});
	});

	req.on('error', e => {
		// console.log('\t:=> Problem with request: ' + e.message);
		callback(e, null);
	});

	if (postData != '') {
		req.write(postData);
	}

	req.end();
};

module.exports = {
	direct: {
		get: (_path, query, body, callback) => {
			generalJob(_path, 'GET', query, body, callback);
		},
		post: (_path, query, body, callback) => {
			generalJob(_path, 'POST', query, body, callback);
		},
		put: (_path, query, body, callback) => {
			generalJob(_path, 'PUT', query, body, callback);
		},
		delete: (_path, query, body, callback) => {
			generalJob(_path, 'DELETE', query, body, callback);
		}
	},
	callbackable: {
		get: (_path, query, body, callback) => {
			return callback => {
				generalJob(_path, 'GET', query, body, callback)
			};
		},
		post: (_path, query, body, callback) => {
			return callback => {
				generalJob(_path, 'POST', query, body, callback)
			};
		},
		put: (_path, query, body, callback) => {
			return callback => {
				generalJob(_path, 'PUT', query, body, callback)
			};
		},
		delete: (_path, query, body, callback) => {
			return callback => {
				generalJob(_path, 'DELETE', query, body, callback)
			};
		}
	}
};
