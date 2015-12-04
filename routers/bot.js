'use strict';

var express = require('express');
var router = express.Router();

var goods = require('../ORM/Goods');

var defaultHTML =
	'<meta property="fb:app_id" content="376506855853722">\
	<meta property="og:type" content="article"/>\
	<meta property="og:description" content="ExchangeWorld 提供一個每個人都可以進行物品交換的平台，讓人們可以將自己用不到但還可以利用的物品與其他人進行交換。交換樂趣！交換世界！" />';

router.get('/seek/:goods_gid', (req, res, next) => {
	var _gid = parseInt(req.params['goods_gid'], 10);

	goods
		.findOne({
			where: {
				gid: _gid
			}
		})
		.then(result => {
			res.send(defaultHTML + '<meta property="og:title" content="來跟我交換 ' + result.name + ' 吧! - ExchangeWorld 交換世界" >' + '<meta property="og:image" content="' + (JSON.parse(result.photo_path))[0] + '"/>' + '<meta property="og:url" content="http://exwd.csie.org/seek/' + _gid + '"/>');
		})
		.catch(err => {
			res.send(err);
		});
});

module.exports = router;
