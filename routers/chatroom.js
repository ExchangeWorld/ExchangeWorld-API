var express = require('express');
var router = express.Router();

// Including tables
var exchanges = require('../ORM/Exchanges');
var messages = require('../ORM/Messages');
var users = require('../ORM/Users');

router.get('/exchange', (req, res) => {

	// Available GET params:
	//
	// eid
	// from
	// number
	//

	var _eid = parseInt(req.query.eid, 10);
	var _from = parseInt(req.query.from, 10);
	var _number = parseInt(req.query.number, 10);

	// default _from is 0 and _number is 10
	// means you will get 10 latest messages in the chatroom
	_from = (_from == _from ? _from : 0);
	_number = (_number == _number ? _number : 10);

	exchanges
		.findOne({
			where: {
				eid: _eid
			}
		})
		.then(_exchange => {
			return messages
				.findAll({
					where: {
						chatroom_cid: _exchange.chatroom_cid
					},
					order: [
						['mid', 'ASC']
					],
					offset: _from,
					limit: _number
				});
		})
		.then(result => {
			res.json(result);
		})
		.catch(err => {
			res.json({
				error: err
			});
		});

});

router.post('/exchange', (req, res) => {

	// Available POST params:
	//
	// eid
	// sender_uid
	// content
	//

	var _eid = parseInt(req.body.eid, 10);
	var _sender_uid = parseInt(req.body.sender_uid, 10);
	var _content = req.body.content;

	exchanges
		.findOne({
			where: {
				eid: _eid
			}
		})
		.then(_exchange => {
			return messages
				.create({
					sender_uid: _sender_uid,
					chatroom_cid: _exchange.chatroom_cid,
					content: _content
				});
		})
		.then(result => {
			res.json(result);
		})
		.catch(err => {
			res.json({
				error: err
			});
		});
});

router.put('/read', (req, res) => {

	// Available PUT body params:
	//
	// mid
	//

	// Get property:value in PUT body
	var _mid = parseInt(req.body.mid, 10);

	messages
		.update({
			unread: false
		}, {
			where: {
				mid: _mid
			}
		})
		.then(result => {
			res.json(result);
		})
		.catch(err => {
			res.json({
				error: err
			});
		});
});

module.exports = router;
