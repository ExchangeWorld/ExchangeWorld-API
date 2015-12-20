var fs = require('fs');
var path = require('path');
var os = require('os');
var sharp = require('sharp');

sharp.concurrency(0);

var imgdir = path.resolve(os.homedir(), './ExchangeWorld/build/images');

var hashedFiles = fs.readdirSync(imgdir).filter(f => f.includes('-500') === true);

hashedFiles.map(f => f.replace('-500', '')).forEach(f => {
	var image = sharp(path.resolve(imgdir, './' + f));
	image
		.clone()
		.resize(160, 200)
		.max()
		.withoutEnlargement()
		.progressive()
		.toBuffer((err, buffer, info) => {
			if (err) {
				console.log(f, err);
			} else {
				fs.writeFile(path.resolve(imgdir, './' + f.split(path.extname(f))[0] + '-160' + path.extname(f)), buffer, err => {
					if (err) {
						console.log(err);
					} else {
						console.log(f, info);
					}
				});
			}
		});
});
