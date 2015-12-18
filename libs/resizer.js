var fs = require('fs');
var path = require('path');
var os = require('os');
var sharp = require('sharp');

sharp.concurrency(0);

var imgdir = path.resolve(os.homedir(), './ExchangeWorld/build/images');

var hashedFiles = fs.readdirSync(imgdir).filter(f => f.length >= 64);

hashedFiles.forEach(f => {
	var image = sharp(path.resolve(imgdir, './' + f));
	image
		.resize(1600, 1200)
		.max()
		.withoutEnlargement()
		.progressive()
		.toBuffer((err, buffer, info) => {
			if (err) {
				console.log(f, err);
			} else {
				fs.writeFile( path.resolve(imgdir, './'+f),buffer, ()=>console.log(f,'good'));
			}
		});
});
