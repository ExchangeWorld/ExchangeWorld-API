var express = require('express');
var router  = express.Router();

// Including tables
var queues = require('../ORM/Queues');
var goods  = require('../ORM/Goods');

// Get queues of a goods
router.get('/of', function(req, res, next) {

	// Available query params:
	// 
	// host_goods_gid
	//

	var _host_goods_gid = req.query.host_goods_gid;

	queues.belongsTo(goods, {foreignKey: 'queuer_goods_gid'});

	queues
		.sync({force: false})
		.then(function() {
			return queues.findAll({
				where: {
					host_goods_gid: _host_goods_gid
				},
				include:[
					{model: goods, required: true}
				]
			});
		})
		.then(function(result) {
			res.json(result);
		})
		.catch(function(err) {
			res.send({error: err});
		});
});

// Get queues queued by a goods
// It means you take one thing to queue many other things
// And you want to get those many other things
router.get('/by', function(req, res, next) {

	// Available query params:
	// 
	// queuer_goods_gid
	//

	var _queuer_goods_gid = req.query.queuer_goods_gid;

	queues.belongsTo(goods, {foreignKey: 'queuer_goods_gid'});

	queues
		.sync({force: false})
		.then(function() {
			return queues.findAll({
				where: {
					queuer_goods_gid: _queuer_goods_gid
				},
				include:[
					{model: goods, required: true}
				]
			});
		})
		.then(function(result) {
			res.json(result);
			
		})
		.catch(function(err) {
			res.send({error: err});
			//res.json({error: err});
		});
});

// Get queues of a person
router.get('/by/person', function(req, res, next) {

	// Available query params:
	// 
	// queuer_user_uid
	//

	var _queuer_user_uid = req.query.queuer_user_uid;

	queues.belongsTo(goods, {foreignKey: 'queuer_goods_gid'});

	goods.findAll({
		where: {
			owner_uid: _queuer_user_uid,
			status: 0,
			deleted: 0
		}
	})
	.then(function(_goods) {

		var _tmp_gids = _goods.map(function(g,i,arr){return g.gid});

		return queues.findAll({
			where: {
				queuer_goods_gid: {
					$in: _tmp_gids
				}
			},
			include:[
				{model: goods, required: true}
			]
		});
	})
	.then(function(result) {
		res.json(result);
	})
	.catch(function(err) {
		res.json({error: err});
	});
})

// Post a queue (queuer_goods_gid -> host_goods_gid)
router.post('/post', function(req, res, next) {

	// Necessary POST body params
	// 
	// host_goods_gid
	// queuer_goods_gid 
	//

	var _host_goods_gid   = req.body.host_goods_gid;
	var _queuer_goods_gid = req.body.queuer_goods_gid;

	queues
		.sync({force: false})
		.then(function() {
			return queues.create({
				host_goods_gid  : _host_goods_gid,
				queuer_goods_gid: _queuer_goods_gid
			});
		})
		.then(function(result) {
			res.json(result);
		})
		.catch(function(err) {
			res.send({error: err});
			//res.json({error: err});
		});

});

// Delete a queue
router.delete('/delete', function(req, res, next) {

	// Necessary DELETE query params
	// 
	// host_goods_gid
	// queuer_goods_gid 
	//
	
	var _host_goods_gid   = req.query.host_goods_gid;
	var _queuer_goods_gid = req.query.queuer_goods_gid;

	queues
		.sync({force: false})
		.then(function() {
			return queues.destroy({
				where: {
					host_goods_gid  : _host_goods_gid,
					queuer_goods_gid: _queuer_goods_gid
				}
			});
		})
		.then(function(result) {
			res.json(result);
		})
		.catch(function(err) {
			res.send({error: err});
			//res.json({error: err});
		});
});

module.exports = router;
