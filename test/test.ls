emitter = require './emitter' .direct
users = require './data' .users
goods = require './data' .goods
/*async = require 'async'*/

do
	/* Registering users */
	err, result <-! emitter.post '/api/authenticate/register', '', users[0], ''
	err, result <-! emitter.post '/api/authenticate/register', '', users[1], ''
	err, result <-! emitter.post '/api/authenticate/register', '', users[2], ''

	/* Login and get tokens */
	err, result <-! emitter.get '/api/authenticate/login', users[0], '', ''
	users[0].token = result.token
	err, result <-! emitter.get '/api/authenticate/login', users[1], '', ''
	users[1].token = result.token
	err, result <-! emitter.get '/api/authenticate/login', users[1], '', ''
	users[2].token = result.token

	/* Posting goods */
	err, result <-! emitter.post '/api/goods/post', users[0], goods[0], ''
	err, result <-! emitter.post '/api/goods/post', users[1], goods[1], ''
	err, result <-! emitter.post '/api/goods/post', users[2], goods[2], ''
	err, result <-! emitter.post '/api/goods/post', users[0], goods[3], ''
	err, result <-! emitter.post '/api/goods/post', users[1], goods[4], ''
	err, result <-! emitter.post '/api/goods/post', users[2], goods[5], ''
	console.log result

	/* Getting goods */
	err, result <-! emitter.get '/api/goods', {gid: 0}, '', users[0]
	console.log result
	err, result <-! emitter.get '/api/goods', {gid: 1}, '', users[1]
	console.log result
	err, result <-! emitter.get '/api/goods', {gid: 2}, '', users[2]
	console.log result
	err, result <-! emitter.get '/api/goods', {gid: 3}, '', users[0]
	console.log result
	err, result <-! emitter.get '/api/goods', {gid: 4}, '', users[1]
	console.log result
	err, result <-! emitter.get '/api/goods', {gid: 5}, '', users[2]
	console.log result
