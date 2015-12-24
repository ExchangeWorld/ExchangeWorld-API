'use strict';

var express = require('express');
var fs = require('fs');
var router = express.Router();

// Sharp lib
var sharp = require('sharp');
sharp.concurrency(2);

// Including tables for photoPath
var goods = require('../ORM/Goods');

// Handle posting image
router.post('/image', function(req, res, next) {

	/*
	 * POST body looks like:
	 * imgData   = /9j/2wCEAAgGBgcGBQgHBwcJC...
	 * imgFormat = png
	 */

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
	var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "").replace(/\s/g, "+");

	// Open a buffer stream
	var dataBuffer = new Buffer(base64Data, 'base64');

	// Get a sha256 hash from its base64data
	var hashData = getSHA256(base64Data);

	// The file path pointing to the image file
	var filePath = '../ExchangeWorld/images_global/' + hashData + '.' + imgFormat.replace(/image\//, '');
	var filePath500 = '../ExchangeWorld/images_global/' + hashData + '-500.' + imgFormat.replace(/image\//, '');
	var filePath250 = '../ExchangeWorld/images_global/' + hashData + '-250.' + imgFormat.replace(/image\//, '');
	// var filePath160 = '../ExchangeWorld/images_global/' + hashData + '-160.' + imgFormat.replace(/image\//, '');

	// Write to file with the filePath
	// And if there is another person who uploaded a same base64 image,
	// The things are still going right because that means same image, why not treat them same?
	// Finally, send the "static file path" back
	var pipeline = sharp(dataBuffer);

	pipeline.clone()
		.rotate()
		.resize(500, null)
		.withoutEnlargement()
		.progressive()
		.toFile(filePath500, null);
	pipeline.clone()
		.rotate()
		.resize(250, null)
		.withoutEnlargement()
		.progressive()
		.toFile(filePath250, null);
	// pipeline.clone()
	// 	.resize(160, null)
	// 	.progressive()
	// 	.withoutEnlargement()
	// 	.toFile(filePath160, null);
	pipeline.clone()
		.rotate()
		.resize(1600, 1200)
		.max()
		.withoutEnlargement()
		.progressive()
		.toFile(filePath, (err, info) => {
			if (err) {
				res.send({
					error: err
				});
			} else {
				// res.send('images/' + hashData + '.' + imgFormat.replace(/image\//, ''));
				res.send('http://exwd.csie.org/images/' + hashData + '.' + imgFormat.replace(/image\//, ''));
			}
		});
});

// Hashcode generation function
var getSHA256 = (function(strToEncrypt) {

	var crypto = require('crypto');
	var sha256 = crypto.createHash('sha256');

	sha256.update(strToEncrypt, 'utf8');

	return sha256.digest('hex');
});

module.exports = router;
