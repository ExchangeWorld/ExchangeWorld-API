var path = require('path');
var fs = require('fs');

var env = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../ENV')));

for (var k in Object.keys(env)) {
	if (k !== undefined) {
		process.env[k] = env[k];
	}
}

module.exports = env;
