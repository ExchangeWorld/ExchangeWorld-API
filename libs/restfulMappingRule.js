var restfulMappingRule = {};
restfulMappingRule.GET = [
	[/\/api\/chatroom\/([0-9]+)\/?$/, (regex, req) => {
		req.urlObj.query.cid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
		req.urlObj.pathname = '/api/chatroom/one';
	}],
	[/\/api\/chatroom\/with\/([0-9]+)\/?$/, (regex, req) => {
		req.urlObj.query.chatter_uid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
		req.urlObj.pathname = '/api/chatroom/with';
	}],
	[/\/api\/chatroom\/([0-9]+)\/message\/?$/, (regex, req) => {
		req.urlObj.query.chatroom_cid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
		req.urlObj.pathname = '/api/message/of/chatroom';
	}],

	[/\/api\/exchange\/([0-9]+)\/?$/, (regex, req) => {
		req.urlObj.query.eid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
		req.urlObj.pathname = '/api/exchange';
	}],

	[/\/api\/follow\/user\/([0-9]+)\/?$/, (regex, req) => {
		req.urlObj.query.followed_uid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
		req.urlObj.pathname = '/api/follow/followers/of';
	}],

	[/\/api\/goods\/?$/, (regex, req) => {
		if (req.urlObj.query.bound === undefined) return;
		req.urlObj.pathname = '/api/goods/search';
	}],
	[/\/api\/goods\/([0-9]+)\/?$/, (regex, req) => {
		req.urlObj.query.gid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
		req.urlObj.pathname = '/api/goods';
	}],
	[/\/api\/goods\/([0-9]+)\/comment\/?$/, (regex, req) => {
		req.urlObj.query.goods_gid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
		req.urlObj.pathname = '/api/comment/of/goods';
	}],
	[/\/api\/goods\/([0-9]+)\/queue\/?$/, (regex, req) => {
		req.urlObj.query.host_goods_gid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
		req.urlObj.pathname = '/api/queue/of/goods';
	}],
	[/\/api\/goods\/([0-9]+)\/star\/?$/, (regex, req) => {
		req.urlObj.query.goods_gid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
		req.urlObj.pathname = '/api/star/to';
	}],

	[/\/api\/queue\/goods\/([0-9]+)\/?$/, (regex, req) => {
		req.urlObj.query.queuer_goods_gid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
		req.urlObj.pathname = '/api/queue/by/goods';
	}],
	[/\/api\/queue\/user\/([0-9]+)\/?$/, (regex, req) => {
		req.urlObj.query.queuer_user_uid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
		req.urlObj.pathname = '/api/queue/by/person';
	}],

	[/\/api\/user\/([0-9]+)\/?$/, (regex, req) => {
		req.urlObj.query.uid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
		req.urlObj.pathname = '/api/user';
	}],
	[/\/api\/user\/([0-9]+)\/chatroom\/?$/, (regex, req) => {
		req.urlObj.query.user_uid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
		req.urlObj.pathname = '/api/chatroom/of/user';
	}],
	[/\/api\/user\/([0-9]+)\/comment\/?$/, (regex, req) => {
		req.urlObj.query.commenter_uid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
		req.urlObj.pathname = '/api/comment/of/user';
	}],
	[/\/api\/user\/([0-9]+)\/exchange\/?$/, (regex, req) => {
		req.urlObj.query.owner_uid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
		req.urlObj.pathname = '/api/exchange/of/user/all';
	}],
	[/\/api\/user\/([0-9]+)\/exchange\/([0-9]+)\/?$/, (regex, req) => {
		var tmp = regex.exec(req.urlObj.pathname);
		req.urlObj.query.owner_uid = parseInt(tmp[1], 10);
		req.urlObj.query.eid = parseInt(tmp[2], 10);
		req.urlObj.pathname = '/api/exchange/of/user/one';
	}],
	[/\/api\/user\/([0-9]+)\/follow\/?$/, (regex, req) => {
		req.urlObj.query.follower_uid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
		req.urlObj.pathname = '/api/follow/followed/by';
	}],
	[/\/api\/user\/([0-9]+)\/goods\/?$/, (regex, req) => {
		req.urlObj.query.owner_uid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
		req.urlObj.pathname = '/api/goods/of';
	}],
	[/\/api\/user\/([0-9]+)\/goods\/([0-9]+)\/?$/, (regex, req) => {
		req.urlObj.query.gid = parseInt(regex.exec(req.urlObj.pathname)[2], 10);
		req.urlObj.pathname = '/api/goods';
	}],
	[/\/api\/user\/([0-9]+)\/queue\/?$/, (regex, req) => {
		req.urlObj.query.host_user_uid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
		req.urlObj.pathname = '/api/queue/of/person';
	}],
	[/\/api\/user\/([0-9]+)\/star\/?$/, (regex, req) => {
		req.urlObj.query.starring_user_uid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
		req.urlObj.pathname = '/api/star/by';
	}]
];

restfulMappingRule.POST = [
	[/\/api\/chatroom\/?$/, (regex, req) => {
		req.urlObj.pathname = '/api/chatroom/create';
	}],
	[/\/api\/comment\/?$/, (regex, req) => {
		req.urlObj.pathname = '/api/comment/post';
	}],
	[/\/api\/exchange\/?$/, (regex, req) => {
		req.urlObj.pathname = '/api/exchange/create';
	}],
	[/\/api\/follow\/?$/, (regex, req) => {
		req.urlObj.pathname = '/api/follow/post';
	}],
	[/\/api\/goods\/?$/, (regex, req) => {
		req.urlObj.pathname = '/api/goods/post';
	}],
	[/\/api\/queue\/?$/, (regex, req) => {
		req.urlObj.pathname = '/api/queue/post';
	}],
	[/\/api\/star\/?$/, (regex, req) => {
		req.urlObj.pathname = '/api/star/post';
	}],
	[/\/api\/user\/?$/, (regex, req) => {
		req.urlObj.pathname = '/api/authenticate/register';
	}]
];

restfulMappingRule.PUT = [
	[/\/api\/chatroom\/([0-9]+)\/join\/?$/, (regex, req) => {
		req.urlObj.query.cid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
		req.urlObj.pathname = '/api/chatroom/join';
	}],
	[/\/api\/chatroom\/([0-9]+)\/leave\/?$/, (regex, req) => {
		req.urlObj.query.cid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
		req.urlObj.pathname = '/api/chatroom/leave';
	}],
	[/\/api\/comment\/([0-9]+)\/?$/, (regex, req) => {
		req.urlObj.query.cid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
		req.urlObj.pathname = '/api/comment/edit';
	}],
	[/\/api\/exchange\/([0-9]+)\/drop\/?$/, (regex, req) => {
		req.urlObj.query.eid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
		req.urlObj.pathname = '/api/exchange/drop';
	}],
	[/\/api\/exchange\/([0-9]+)\/agree\/?$/, (regex, req) => {
		req.urlObj.query.eid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
		req.urlObj.pathname = '/api/exchange/agree';
	}],
	[/\/api\/goods\/([0-9]+)\/?$/, (regex, req) => {
		req.urlObj.query.gid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
		req.urlObj.pathname = '/api/goods/edit';
	}],
	[/\/api\/goods\/([0-9]+)\/rate\/?$/, (regex, req) => {
		req.urlObj.query.gid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
		req.urlObj.pathname = '/api/goods/rate';
	}],
	[/\/api\/user\/([0-9]+)\/?$/, (regex, req) => {
		req.urlObj.query.uid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
		req.urlObj.pathname = '/api/user/edit';
	}],
	[/\/api\/user\/([0-9]+)\/photo\/?$/, (regex, req) => {
		req.urlObj.query.uid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
		req.urlObj.pathname = '/api/user/photo';
	}]
];

restfulMappingRule.DELETE = [
	[/\/api\/chatroom\/([0-9]+)\/?$/, (regex, req) => {
		req.urlObj.query.cid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
		req.urlObj.pathname = '/api/chatroom/delete';
	}],
	[/\/api\/comment\/([0-9]+)\/?$/, (regex, req) => {
		req.urlObj.query.cid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
		req.urlObj.pathname = '/api/comment/delete';
	}],
	[/\/api\/exchange\/([0-9]+)\/?$/, (regex, req) => {
		req.urlObj.query.eid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
		req.urlObj.pathname = '/api/exchange/drop';
	}],
	[/\/api\/follow\/([0-9]+)\/to\/([0-9]+)\/?$/, (regex, req) => {
		req.urlObj.query.follower_uid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
		req.urlObj.query.followed_uid = parseInt(regex.exec(req.urlObj.pathname)[2], 10);
		req.urlObj.pathname = '/api/follow/delete';
	}],
	[/\/api\/goods\/([0-9]+)\/?$/, (regex, req) => {
		req.urlObj.query.gid = parseInt(regex.exec(req.urlObj.pathname)[1], 10);
		req.urlObj.pathname = '/api/goods/delete';
	}],
	[/\/api\/queue\/([0-9]+)\/to\/([0-9]+)\/?$/, (regex, req) => {
		var tmp = regex.exec(req.urlObj.pathname);
		req.urlObj.query.queuer_goods_gid = parseInt(tmp[1], 10);
		req.urlObj.query.host_goods_gid = parseInt(tmp[2], 10);
		req.urlObj.pathname = '/api/queue/delete';
	}],
	[/\/api\/star\/([0-9]+)\/to\/([0-9]+)\/?$/, (regex, req) => {
		var tmp = regex.exec(req.urlObj.pathname);
		req.urlObj.query.starring_user_uid = parseInt(tmp[1], 10);
		req.urlObj.query.goods_gid = parseInt(tmp[2], 10);
		req.urlObj.pathname = '/api/star/delete';
	}]
];

restfulMappingRule.OPTIONS = [].concat(restfulMappingRule.POST, restfulMappingRule.PUT, restfulMappingRule.DELETE);

module.exports = restfulMappingRule;
