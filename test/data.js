var users = require('./data/users');
var goods = require('./data/goods');

// Modification and exporting
module.exports = {
	users: users.map(u => {
		u.token = '';
		return u;
	}),
	goods: goods.map((g, i) => {
		g.owner_uid = i % users.length + 1;
		return g;
	})
};
