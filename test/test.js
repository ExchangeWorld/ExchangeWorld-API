var emitterF = require('./emitter').functional;
var async = require('async');

var newUser1 = {
	fb: false,
	identity: 'noeleon938',
	password: '12241224',
	name: 'Noel Bao',
	email: 'noeleon930@gmail.com',
	photo_path: null
};

var newUser2 = {
	fb: true,
	identity: 'noeleon939',
	password: '12241224',
	name: 'Noel Bao',
	email: 'noeleon930@gmail.com',
	photo_path: null
};

async.series([
	emitterF.post('/api/authenticate/register', '', newUser1),
	emitterF.post('/api/authenticate/register', '', newUser2)
], (err, results) => {
	if (err) {
		console.error(err);
	}
	console.log(results);
});
