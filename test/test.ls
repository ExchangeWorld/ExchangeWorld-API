emitter = require './emitter' .direct
users = require './data' .users
goods = require './data' .goods
/*async = require 'async'*/

log = (o) !-> console.log(JSON.stringify o)
check = (o) !-> console.log(if o != null then '└─[Success]' else '└─[Fail]')

do
	/* Registering users */
	err, result <-! emitter.post '/api/authenticate/register', '', users[0], ''
	check result
	err, result <-! emitter.post '/api/authenticate/register', '', users[1], ''
	check result
	err, result <-! emitter.post '/api/authenticate/register', '', users[2], ''
	check result

	/* Login and get tokens */
	err, result <-! emitter.get '/api/authenticate/login', users[0], '', ''
	check result
	users[0].token = result.token
	err, result <-! emitter.get '/api/authenticate/login', users[1], '', ''
	check result
	users[1].token = result.token
	err, result <-! emitter.get '/api/authenticate/login', users[1], '', ''
	check result
	users[2].token = result.token

	/* Posting goods */
	err, result <-! emitter.post '/api/goods/post', users[0], goods[0], ''
	do
		check result
		goods[0] = result
	err, result <-! emitter.post '/api/goods/post', users[1], goods[1], ''
	do
		check result
		goods[1] = result
	err, result <-! emitter.post '/api/goods/post', users[2], goods[2], ''
	do
		check result
		goods[2] = result
	err, result <-! emitter.post '/api/goods/post', users[0], goods[3], ''
	do
		check result
		goods[3] = result
	err, result <-! emitter.post '/api/goods/post', users[1], goods[4], ''
	do
		check result
		goods[4] = result
	err, result <-! emitter.post '/api/goods/post', users[2], goods[5], ''
	do
		check result
		goods[5] = result

	/* Getting goods */
	err, result <-! emitter.get '/api/goods', {gid: 1}, '', users[1]
	check result
	err, result <-! emitter.get '/api/goods', {gid: 2}, '', users[2]
	check result
	err, result <-! emitter.get '/api/goods', {gid: 3}, '', users[0]
	check result
	err, result <-! emitter.get '/api/goods', {gid: 4}, '', users[1]
	check result
	err, result <-! emitter.get '/api/goods', {gid: 5}, '', users[2]
	check result
	err, result <-! emitter.get '/api/goods', {gid: 6}, '', users[0]
	check result

	/* Getting goods of owner */
	err, result <-! emitter.get '/api/goods/of', {owner_uid: 1}, '', users[0]
	log result
	err, result <-! emitter.get '/api/goods/of', {owner_uid: 2}, '', users[1]
	log result
	err, result <-! emitter.get '/api/goods/of', {owner_uid: 3}, '', users[2]
	log result
	err, result <-! emitter.get '/api/goods/of', {owner_uid: 4}, '', users[3]
	log result

	/* Editting some goods */
	err, result <-! emitter.put '/api/goods/edit', '', (do -> goods[0].name = 'lalalalala'; goods[0]), users[0]
	log result
	err, result <-! emitter.put '/api/goods/edit', '', {gid: 100}, users[1]
	log result

	/*  Rating some goods */
	err, result <-! emitter.put '/api/goods/rate', '', {gid: 1, rate: 4.9}, users[0]
	log result
	err, result <-! emitter.put '/api/goods/rate', '', {gid: 10, rate: 4.9}, users[0]
	log result

	/* Deleting some goods */
	err, result <-! emitter.delete 'api/goods/delete', {gid: 1}, '', users[0]
	log result
	err, result <-! emitter.delete 'api/goods/delete', {gid: 10}, '', users[0]
	log result
