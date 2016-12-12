'use strict';

var path = require('path');
var os = require('os');

var Sequelize = require('sequelize');

var env = require(path.resolve(__dirname, './env'));
var async = require('async');

var crypto = require('crypto');
var sec_ran = require('secure-random');
var getSHA256 = strToEncrypt => {
	var sha256 = crypto.createHash('sha256');
	sha256.update(strToEncrypt, 'utf8');
	return sha256.digest('hex');
};

var sequelize_sync = require(path.resolve(__dirname, './sync'));

var v2_auths = require(path.resolve(__dirname, '../ORM/Auths'));
var v2_users = require(path.resolve(__dirname, '../ORM/Users'));
var v2_goods = require(path.resolve(__dirname, '../ORM/Goods'));
var v2_exchanges = require(path.resolve(__dirname, '../ORM/Exchanges'));

var v1 = new Sequelize('exchangeworld', 'root', '12241224', {
	host: (env.NODE_ENV === 'production' ? 'localhost' : 'exwd.csie.org'),
	port: (env.NODE_ENV === 'production' ? 5432 : 45432),

	dialect: 'postgres',

	// We will use another async-logger soon
	logging: (env.NODE_ENV !== 'production' ? console.log : false),

	// maxConcurrentQueries: 200,

	// When server fired, check all the schema
	// BUT NOT while every visit
	// sync: { force: true },

	pool: {
		maxConnections: (os.cpus().length + 1) / 2,
		minConnections: 1,
		maxIdleTime: 3000
	},
	define: {
		timestamps: false
	}
});

var v1_users = v1.define('users', {
	uid: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		primaryKey: true,
		autoIncrement: true
	},
	fb_id: {
		type: Sequelize.STRING,
		allowNull: false,
		unique: true
	},
	name: {
		type: Sequelize.STRING,
		allowNull: false
	},
	email: {
		type: Sequelize.STRING,
		allowNull: true
	},
	photo_path: {
		type: Sequelize.STRING,
		allowNull: true
	},
	introduction: {
		type: Sequelize.TEXT,
		allowNull: true
	},
	wishlist: {
		type: Sequelize.TEXT,
		allowNull: true
	}
}, {
	tableName: 'users'
});

var v1_goods = v1.define('goods', {
	gid: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		autoIncrement: true,
		primaryKey: true
	},
	owner_uid: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false
	},
	name: {
		type: Sequelize.STRING,
		allowNull: false
	},
	photo_path: {
		type: Sequelize.TEXT,
		allowNull: true
	},
	category: {
		type: Sequelize.STRING,
		allowNull: false
	},
	description: {
		type: Sequelize.TEXT,
		allowNull: true
	},
	position_x: {
		type: Sequelize.FLOAT,
		allowNull: false,
		defaultValue: -1
	},
	position_y: {
		type: Sequelize.FLOAT,
		allowNull: false,
		defaultValue: -1
	},
	rate: {
		type: Sequelize.FLOAT,
		allowNull: true,
		defaultValue: 0
	},
	// 0 means not exchanged yet, 1 means exchanged, 2 means exchanging
	status: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 0
	},
	// 0 means not deleted yet, 1 means deleted
	deleted: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 0
	}
}, {
	tableName: 'goods'
});

var v1_exchanges = v1.define('exchanges', {
	eid: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		autoIncrement: true,
		primaryKey: true
	},
	// Smaller goods_gid puts here
	goods1_gid: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false
	},
	// Larger goods_gid puts here
	goods2_gid: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false
	},
	// Set agree or not for goods1
	goods1_agree: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	},
	// Set agree or not for goods2
	goods2_agree: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	},
	// Set exchange's chatroom
	chatroom_cid: {
		type: Sequelize.INTEGER,
		allowNull: false,
		unique: true
	},
	// 'initiated', 'dropped', 'completed'
	status: {
		type: Sequelize.STRING,
		allowNull: false,
		defaultValue: 'initiated'
	}
}, {
	tableName: 'exchanges'
});

/*
v2 auth:

	aid serial NOT NULL,
	user_identity character varying(255) NOT NULL,
	salt text NOT NULL,
	answer text NOT NULL,
	user_uid integer,

v1 user:

	uid serial NOT NULL,
	fb_id character varying(255) NOT NULL,
	name character varying(255) NOT NULL,
	email character varying(255),
	photo_path character varying(255),
	introduction text,
	wishlist text,

v2 user:

	uid serial NOT NULL,
	identity character varying(255) NOT NULL,
	name character varying(255) NOT NULL,
	email character varying(255),
	photo_path text,
	introduction text,
	wishlist text[] NOT NULL DEFAULT ARRAY[]::text[],
	extra_json jsonb NOT NULL DEFAULT '{}'::jsonb,

v1 goods:

	gid serial NOT NULL,
	owner_uid integer NOT NULL,
	name character varying(255) NOT NULL,
	photo_path text,
	category character varying(255) NOT NULL,
	description text,
	position_x double precision NOT NULL DEFAULT (-1),
	position_y double precision NOT NULL DEFAULT (-1),
	rate double precision DEFAULT 0,
	status integer NOT NULL DEFAULT 0,
	deleted integer NOT NULL DEFAULT 0,

v2 goods:

	gid serial NOT NULL,
	name text NOT NULL,
	photo_path text,
	category text NOT NULL,
	description text,
	position_x double precision NOT NULL DEFAULT (-1),
	position_y double precision NOT NULL DEFAULT (-1),
	rate double precision DEFAULT 0,
	exchanged integer NOT NULL DEFAULT 0,
	deleted integer NOT NULL DEFAULT 0,
	extra_json jsonb NOT NULL DEFAULT '{}'::jsonb,
	owner_uid integer,

v1 exchange:

	eid serial NOT NULL,
	goods1_gid integer NOT NULL,
	goods2_gid integer NOT NULL,
	goods1_agree boolean NOT NULL DEFAULT false,
	goods2_agree boolean NOT NULL DEFAULT false,
	chatroom_cid integer NOT NULL,
	status character varying(255) NOT NULL DEFAULT 'initiated'::character varying,

v2 exchange:

	eid serial NOT NULL,
	goods_one_agree boolean NOT NULL DEFAULT false,
	goods_two_agree boolean NOT NULL DEFAULT false,
	status character varying(255) NOT NULL DEFAULT 'initiated'::character varying,
	created_at timestamp with time zone NOT NULL,
	updated_at timestamp with time zone NOT NULL,
	goods_one_gid integer,
	goods_two_gid integer,
*/

sequelize_sync
	.then(() => {
		console.log('DB all synced ...');
		console.log('Igniting API server ...');
	})
	.then(() => {
		return v1_users
			.findAll({
				order: [
					['uid', 'ASC']
				]
			})
			.then(users => {
				return users
					.map(_u => JSON.stringify(_u))
					.map(_s => JSON.parse(_s))
					.map(_u => {
						// console.log(_u);
						return {
							uid: _u.uid,
							identity: _u.fb_id,
							name: _u.name,
							email: (_u.email === null ? '' : _u.email),
							photo_path: _u.photo_path,
							introduction: (_u.introduction === null ? '' : _u.introduction),
							wishlist: (_u.wishlist === null ? [] : _u.wishlist.split('、').filter(c => c.length > 0))
						};
					});
			});
	})
	.then(users => {
		return v2_users.bulkCreate(users);
	})
	.then(users => {
		return new Promise((resolve, reject) => {
			var q = async.queue((u, callback) => {
				var _id = u.identity;
				var id_length = _id.length;

				var _password = getSHA256(_id.substring(id_length - 2, id_length) + ' and this is still a fucking hash with ' + _id.substring(0, id_length - 2));
				var _salt = JSON.stringify(sec_ran.randomArray(7));
				var _answer = getSHA256(_password + ' and this is a fucking hash with ' + _salt);

				v2_auths
					.create({
						user_identity: _id,
						salt: _salt,
						answer: _answer,
						user_uid: u.uid
					})
					.then(() => {
						callback();
					})
					.catch(err => {
						reject(err);
					});
			}, 1);

			q.drain = () => {
				resolve();
			};

			q.push(users.map(u => u.toJSON()));
		});
	})
	.then(() => {
		return v1_goods
			.findAll({
				order: [
					['gid', 'ASC']
				]
			})
			.then(goods => {
				return goods
					.map(g => JSON.stringify(g))
					.map(g => JSON.parse(g))
					.map(g => {
						g.exchanged = g.status;
						g.status = undefined;
						return g;
					});
			});
	})
	.then(goods => {
		var maxGid = goods[goods.length - 1].gid;

		for (var i = 1; i <= maxGid; i++) {
			if (goods.filter(g => g.gid === i).length === 0) {
				goods.push({
					gid: i,
					name: 'Deleted Goods',
					photo_path: '',
					category: '',
					description: '',
					position_x: 0,
					position_y: 0,
					deleted: 1,
					owner_uid: 1
				});

				console.log('Goods', i, 'added');
			}
		}

		return v2_goods.bulkCreate(goods);
	})
	.then(() => {
		return v1_exchanges
			.findAll({
				order: [
					['eid', 'ASC']
				]
			})
			.then(exchange => {
				return exchange
					.map(e => JSON.stringify(e))
					.map(e => JSON.parse(e))
					.map(e => {
						return {
							eid: e.eid,
							goods_one_agree: e.goods1_agree,
							goods_two_agree: e.goods2_agree,
							goods_one_gid: e.goods1_gid,
							goods_two_gid: e.goods2_gid,
							status: e.status
						};
					});
			});
	})
	.then(exchanges => {
		return v2_exchanges.bulkCreate(exchanges);
	})
	.then(() => {
		console.log('done');
		setTimeout(() => {
			process.exit(0);
		}, 3000);
	})
	.catch(err => {
		console.log(err);
	});
