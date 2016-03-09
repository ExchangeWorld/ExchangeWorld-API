'use strict';

var Redis = require('ioredis');
var redis = new Redis({
	password: '12241224'
});

module.exports = redis;
