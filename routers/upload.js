/**
 * Provides some methods related to uploads
 *
 * @class Upload
 */

'use strict';

var express = require('express');
var fs = require('fs');
var router = express.Router();

// Sharp lib
var sharp = require('sharp');
sharp.concurrency(2);

// Hashcode generation function
var getSHA256 = strToEncrypt => {
	var crypto = require('crypto');
	var sha256 = crypto.createHash('sha256');

	sha256.update(strToEncrypt, 'utf8');

	return sha256.digest('hex');
};

/**
 * Post an image
 *
 * @method POST api/upload/image
 * @param  {Integer} filesize
 * @param  {String} filename
 * @param  {String} base64 Encoded imgData from request body
 * @param  {String} filetype
 * @return {URL} Image's src
 */
router.post('/image', function (req, res, next) {

	/*
	 * POST body looks like:
	 * imgData   = /9j/2wCEAAgGBgcGBQgHBwcJC...
	 * imgFormat = png
	 */

	// REQ EXWD CHECK
	if (req.exwd.anonymous) {
		res.status(403).json({
			error: 'Permission denied'
		});
		return;
	}

	// Get file size
	var imgSize = req.body.filesize;

	// Get filename
	var imgName = req.body.filename;

	// Get base64 encoded imgData from request body
	var imgData = req.body.base64;

	// Get image format type, like jpg or png
	var imgFormat = req.body.filetype;

	// Remove annotations and fix space to +
	// And become pure base64 string
	var base64Data = imgData.replace(/^data:image\/\w+;base64,/, '').replace(/\s/g, '+');

	// Open a buffer stream
	var dataBuffer = new Buffer(base64Data, 'base64');

	// Get a sha256 hash from its base64data
	var hashData = getSHA256(base64Data);

	// The file path pointing to the image file
	//var filePath = '../ExchangeWorld/images_global/' + hashData + '.' + imgFormat.replace(/image\//, '');
	//var filePath500 = '../ExchangeWorld/images_global/' + hashData + '-500.' + imgFormat.replace(/image\//, '');
	//var filePath250 = '../ExchangeWorld/images_global/' + hashData + '-250.' + imgFormat.replace(/image\//, '');
	
	// 2016/12/12 tmp fix (fixed to png format)
	var filePath = '../ExchangeWorld/images_global/' + hashData + '.png';
	var filePath500 = '../ExchangeWorld/images_global/' + hashData + '-500.png';
	var filePath250 = '../ExchangeWorld/images_global/' + hashData + '-250.png';

	// Write to file with the filePath
	// And if there is another person who uploaded a same base64 image,
	// The things are still going right because that means same image, why not treat them same?
	// Finally, send the "static file path" back
	var pipeline = sharp(dataBuffer);

	// 2016/12/12 tmp fix (fixed to png format)
	pipeline.clone()
		.rotate()
		.resize(500, null)
		.withoutEnlargement()
		.png({progressive: true})
		.toFile(filePath500, null);

	// 2016/12/12 tmp fix (fixed to png format)
	pipeline.clone()
		.rotate()
		.resize(250, null)
		.withoutEnlargement()
		.png({progressive: true})
		.toFile(filePath250, null);

	// 2016/12/12 tmp fix (fixed to png format)
	pipeline.clone()
		.rotate()
		.resize(1600, 1200)
		.max()
		.withoutEnlargement()
		.png({progressive: true})
		.toFile(filePath, (err, info) => {
			if (err) {
				res.status(500).json({
					error: err
				});
			} else {
				//res.send('http://exwd.csie.org/images/' + hashData + '.' + imgFormat.replace(/image\//, ''));
				res.send('http://exwd.csie.org/images/' + hashData + '.png');
			}
		});
});

module.exports = router;
