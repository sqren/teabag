var Q = require('q');
var WebTorrent = require('webtorrent');
var _ = require('lodash');

function torrentService() {
	var service = {};

	service.getName = function(files) {
		var name = files[0].name;
		if (files.length > 1){
			name += ' and ' + (files.length - 1) + ' other file(s)';
		}
		return name;
	};

	service.getFileType = function(filename) {
		var ext = filename.split('.').pop();
		var videoExtensions = require('video-extensions');
		var imageExtensions = require('image-extensions');

		var isImage = _.contains(imageExtensions, ext);
		var isVideo = _.contains(videoExtensions, ext);

		if (isImage) {
			return 'image';
		} else if (isVideo){
			return 'video';
		}
	};

	service.getFileUrl = function(file) {
		return Q.Promise(function(resolve, reject) {
			file.getBlobURL(function(err, url) {
				if (err) {
					reject(err);
				}
				resolve({
					name: file.name,
					url: url,
				});
			});
		});
	};

	service.getFileUrls = function(torrent) {
		var promises = torrent.files.map(service.getFileUrl);
		return Q.all(promises);
	};

	service.getProgress = function(torrent) {
		try {
			return Math.round(torrent.downloaded / torrent.parsedTorrent.length * 100) || 0;
		} catch (e) {
			return 0;
		}
	};

	service.seed = function(files) {
		var client = new WebTorrent();
		return Q.promise(function(resolve, reject) {
			client.seed(files, resolve);
			client.on('warning', function(msg) {
				console.log('msg', msg);
			});
			client.on('error', reject);
		});
	};

	return service;
}

module.exports = [torrentService];
