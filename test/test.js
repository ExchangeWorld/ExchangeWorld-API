var emitter = require('./emitter');

var newUser = {
	fb: false,
	identity: 'noeleon935',
	password: '12241224',
	name: 'Noel Bao',
	email: 'noeleon930@gmail.com',
	photo_path: null
};

emitter.post('/api/authenticate/register', '', newUser, obj => {
	console.log('\t :=>', obj);
});

// setTimeout(() => {
// 	console.log('Test is done');
// }, 5000);
