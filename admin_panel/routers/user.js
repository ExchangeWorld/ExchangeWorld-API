'use strict';

// var path = require('path');

var express = require('express');
var router = express.Router();

// var redis = require(path.resolve(__dirname, '../../libs/redis'));

router.param('id', (req, res, next, id) => {
	let _restful_id = parseInt(id, 10);

	if (!(_restful_id)) {
		res.status(500).json({
			error: 'id is not a number'
		});
	}

	req.restful_id = _restful_id;

	next();
});

router.get('/:id', (req, res) => {
	console.log(req.restful_id);
	res.status(200).json(req.restful_id);
});

module.exports = router;
