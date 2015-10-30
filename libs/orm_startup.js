var startup = () => {
	var orms = [];

	orms.push(require('../ORM/Auths.js'));
	orms.push(require('../ORM/Chatrooms.js'));
	orms.push(require('../ORM/Comments.js'));
	orms.push(require('../ORM/Exchanges.js'));
	orms.push(require('../ORM/Followers.js'));
	orms.push(require('../ORM/Followings.js'));
	orms.push(require('../ORM/Goods.js'));
	orms.push(require('../ORM/Messages.js'));
	orms.push(require('../ORM/Notifications.js'));
	orms.push(require('../ORM/Queues.js'));
	orms.push(require('../ORM/Stars.js'));
	orms.push(require('../ORM/Tokens.js'));
	orms.push(require('../ORM/Users'));

	orms.forEach(o => {
		o.sync({
			force: false
		})
		.then(() => console.log(o, 'sync complete'));
	});
};

module.exports = startup;
