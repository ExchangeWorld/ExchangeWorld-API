var http = require('http');

var proxy = require('redbird')({
	port: 1688
});

proxy.register('localhost/1689', 'http://localhost:1689');
proxy.register('localhost/1690', 'http://localhost:1690');
proxy.register('localhost/1691', 'http://localhost:1691');

var server_1689 = http.createServer((req, res) => {
	req.headers.url = req.url;
	res.end(JSON.stringify(req.headers, null, '  ') + '\n\nfuck you 1689');
});
server_1689.listen(1689);

var server_1690 = http.createServer((req, res) => {
	req.headers.url = req.url;
	res.end(JSON.stringify(req.headers, null, '  ') + '\n\nfuck you 1690');
});
server_1690.listen(1690);

var server_1691 = http.createServer((req, res) => {
	req.headers.url = req.url;
	res.end(JSON.stringify(req.headers, null, '  ') + '\n\nfuck you 1691');
});
server_1691.listen(1691);
