var express = require('express');
var jwt = require('jsonwebtoken');
var sec_ran = require('secure-random');
var router = express.Router();

// Including tables
var users = require('../ORM/Users');
var auths = require('../ORM/Auths');
var tokens = require('../ORM/Tokens');

// Register a new user
// And return a token (jwt generated)
// Override the registering in /api/user/register
router.post('/register', (req, res) => {

	// **WARNING**
	// fb_id will be id
	// and the password for fb will be from a hash func
	// **WARNING**

	var _fb = ((req.body.fb || '') == 'true') ? true : false;
	var _id = req.body.identity;
	var _password = req.body.password || '';
	var _name = req.body.name;
	var _email = req.body.email || '';
	var _photo_path = req.body.photo_path || '';

	// Create password for fb
	if (_fb === true) {
		var id_length = _id.length;
		_password = getSHA256(_id.substring(id_length - 2, id_length) + ' and this is still a fucking hash with ' + _id.substring(0, id_length - 2));
	}

	// Create user instance
	users
		.create({
			identity: _id,
			name: _name,
			email: _email,
			photo_path: _photo_path
		})
		.then(result => {

			var _salt = JSON.stringify(sec_ran.randomArray(7));

			var _answer = getSHA256(_password + ' and this is a fucking hash with ' + _salt);

			auths.create({
					user_identity: _id,
					salt: _salt,
					answer: _answer
				})
				.catch(err => {
					res.json(err);
				});

			return result;
		})
		.then(result => {
			res.json(result);
		})
		.catch(err => {
			res.json(err);
		});

});

// Login
var login_function = (req, res) => {

	var _fb = ((req.query.fb || '') == 'true') ? true : false;
	var _id = req.query.identity;
	var _password = req.query.password || '';

	if (_fb === true) {
		var id_length = _id.length;
		_password = getSHA256(_id.substring(id_length - 2, id_length) + ' and this is still a fucking hash with ' + _id.substring(0, id_length - 2));
	}

	auths
		.findOne({
			where: {
				user_identity: _id
			}
		})
		.then(test_user => {
			if (test_user != undefined && getSHA256(_password + ' and this is a fucking hash with ' + test_user.salt) === test_user.answer) {
				return test_user;
			} else {
				return 'not a user';
			}
		})
		.then(test_user => {

			if (test_user === 'not a user') {
				res.json({
					authentication: 'fail',
					token: null
				});
			} else {

				tokens
					.create({
						token: jwt.sign({
							identity: _id,
							password: _password
						}, '事實上我們做了一年', {
							expiresInMinutes: 10
						})
					})
					.then(result => {
						res.json({
							authentication: 'success',
							token: result.token
						});
					})
					.catch(err => {
						res.json(err);
					});
			}
		})
		.catch(err => {
			res.json(err);
		});
};
router.get('/login', login_function);


// Token middleware
var token_function = (req, res, next) => {

	var _token = req.query.token || '';

	tokens
		.findOne({
			where: {
				token: _token
			}
		})
		.then(result => {

			if (result != null && result != undefined) {
				jwt.verify(result.token, '事實上我們做了一年', (err, decoded) => {
					if (err) {
						res.json({
							authentication: 'timeout',
							err: err
						});
					} else {
						next();
					}
				});

			} else {
				res.json({
					authentication: 'fail',
				});
				// next();
			}
		})
		.catch(err => {
			res.json(err);
		});
};
router.get('/', token_function);

// Hashcode generation function
var getSHA256 = (strToEncrypt => {

	var crypto = require('crypto');
	var sha256 = crypto.createHash('sha256');

	sha256.update(strToEncrypt, 'utf8');

	return sha256.digest('hex');
});

module.exports = {
	router: router,
	login: login_function,
	token: token_function
};
