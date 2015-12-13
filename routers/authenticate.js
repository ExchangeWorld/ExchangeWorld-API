/**
 * Provides some methods related to any authentications
 *
 * @class Authenticate
 */

'use strict';

var path = require('path');
var crypto = require('crypto');

var express = require('express');
var sec_ran = require('secure-random');
var redis = require(path.resolve(__dirname, '../libs/redis'));
var router = express.Router();

// Including tables
var users = require('../ORM/Users');
var auths = require('../ORM/Auths');
var tokens = require('../ORM/Tokens');

// Hashcode generation functions
var getSHA256 = strToEncrypt => {
	var sha256 = crypto.createHash('sha256');

	sha256.update(strToEncrypt, 'utf8');

	return sha256.digest('hex');
};

// Faster
var getSHA1 = strToEncrypt => {
	var sha1 = crypto.createHash('sha1');

	sha1.update(strToEncrypt, 'utf8');

	return sha1.digest('hex');
};

/**
 * Register a new user
 *
 * @method POST api/authenticate/register
 * @param  {Boolean=false} fb If the registeration is with FB
 * @param  {String} identity The user ID. If it's with FB, fb_id as identity
 * @param  {String=''} password Password. If it's with FB, password will be generated by hash
 * @param  {String} name The displaying name
 * @param  {String=''} email The email
 * @param  {String=''} photo_path The photo path of user face photo
 * @return {JSON} New created user object
 */
router.post('/register', (req, res) => {
	var _fb = ((req.body.fb || '') === 'true');
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

			auths
				.create({
					user_identity: _id,
					salt: _salt,
					answer: _answer
				})
				.catch(err => {
					res.send({
						error: err
					});
				});

			return result;
		})
		.then(result => {
			res.json(result);
		})
		.catch(err => {
			res.send({
				error: err
			});
		});
});

/**
 * Login
 *
 * @method GET api/authenticate/login
 * @param  {Boolean=false} fb If the login is with FB
 * @param  {String} identity The user ID. If it's with FB, fb_id as identity
 * @param  {String=''} password Password. If it's with FB, password will be checked by hash
 * @return {JSON} Token
 * @example
<pre>
{
	authentication: 'success',
	token: token
}
</pre>
 * @example
<pre>
{
	authentication: 'fail',
	token: null
}
</pre>
 */
var login_function = (req, res) => {
	var _fb = ((req.query.fb || '') === 'true');
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
			},
			include: [{
				model: users,
				required: true,
				attributes: ['uid']
			}]
		})
		.then(test_user => {
			if (test_user !== undefined && test_user !== null && getSHA256(_password + ' and this is a fucking hash with ' + test_user.salt) === test_user.answer) {
				return test_user;
			}
			return 'not a user';
		})
		.then(test_user => {
			if (test_user === 'not a user' || test_user.user === null || test_user.user.uid === null) {
				res.json({
					authentication: 'fail',
					token: null
				});
			} else {
				var _salt = JSON.stringify(sec_ran.randomArray(7));
				var tmpToken = getSHA1(test_user.user_identity + _salt);

				redis.pipeline().set(tmpToken, test_user.user.uid).expire(tmpToken, 1200).exec((err, result) => {
					if (err) {
						res.send({
							error: err
						});
					} else if (result[0][0] || result[1][0]) {
						res.send({
							error: [result[0][0], result[1][0]]
						});
					} else {
						res.json({
							authentication: 'success',
							token: tmpToken
						});
					}
				});
			}
		})
		.catch(err => {
			res.send({
				error: err
			});
		});
};
router.get('/login', login_function);

/**
 * Token validation
 *
 * @method GET *?token=...
 * @param  {String=''} TOKEN
 * @return {JSON|Nothing} If failed, return JSON
 * @example
<pre>
{
	authentication: 'fail',
	token: null
}
</pre>
 */
var token_function = (req, res, next) => {
	var _token = req.query.token || '';

	if (token === '') {
		// EXWD middleware >w<
		req.exwd = {
			byuser: -1
		};

		next();
	} else {
		redis.get(_token, (err, result) => {
			if (err) {
				res.send({
					error: err
				});
			} else if (result === null) {
				res.json({
					authentication: 'fail',
					token: null
				});
			} else {
				redis.pieline().set(_token, result).expire(_token, 1200).exec((err, res) => {
					if (err) {
						res.send({
							error: err
						});
					} else {
						// EXWD middleware >w<
						req.exwd = {
							byuser: result
						};

						next();
					}
				});
			}
		});
	}
};
router.get('/', token_function);

module.exports = {
	router: router,
	login: login_function,
	token: token_function
};
