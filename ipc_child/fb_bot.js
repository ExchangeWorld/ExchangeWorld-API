'use strict';

var goods = require('../ORM/Goods');

var templateHTML =
	'<meta property="fb:app_id" content="376506855853722">\
	<meta property="og:type" content="article"/>\
	<meta property="og:description" content="ExchangeWorld 提供一個每個人都可以進行物品交換的平台，讓人們可以將自己用不到但還可以利用的物品與其他人進行交換。交換樂趣！交換世界！" />';

var defaultHTML = '<meta property="og:title" content="ExchangeWorld - 交換樂趣！交換世界！" >\
<meta property="fb:app_id" content="376506855853722">\
<meta property="og:type" content="article"/>\
<meta property="og:url" content="http://exwd.csie.org/"/>\
<meta property="og:image" content="http://exwd.csie.org/images/exchange-img.jpg"/>\
<meta property="og:description" content="ExchangeWorld 提供一個每個人都可以進行物品交換的平台，讓人們可以將自己用不到但還可以利用的物品與其他人進行交換。交換樂趣！交換世界！" />';

// When the Static Server encounters a bot, will send a message to this .js

// var msg = process.argv[2];
// var _path = msg.split('/');
process.setMaxListeners(0);
process.on('message', msg => {
	var _path = msg.split('/');
	if (msg.startsWith('/seek')) {
		var _gid = parseInt(_path[_path.length - 1], 10);
		goods
			.findOne({
				where: {
					gid: _gid
				}
			})
			.then(result => {
				if (result == null) {
					process.send(defaultHTML);
				} else {
					if(result.description.includes('<p>禮物')) {
						process.send(templateHTML + '<meta property="og:title" content="來跟我交換 ' + '神秘聖誕禮物' + ' 吧! - ExchangeWorld 交換世界" >' + '<meta property="og:image" content="http://exwd.csie.org/images/Gift.jpg"/>' + '<meta property="og:url" content="http://exwd.csie.org/seek/' + _gid + '"/>');
					} else {
						process.send(templateHTML + '<meta property="og:title" content="來跟我交換 ' + result.name + ' 吧! - ExchangeWorld 交換世界" >' + '<meta property="og:image" content="' + (JSON.parse(result.photo_path))[0] + '"/>' + '<meta property="og:url" content="http://exwd.csie.org/seek/' + _gid + '"/>');
					}
				}
			})
			.catch(err => {
				process.send(defaultHTML);
			});
	} else {
		process.send(defaultHTML);
	}
});
