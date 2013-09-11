var _       = require('lodash'),
	config  = require('./module/config/config'),
	fs      = require('fs'),
	os      = require('os'),
	domain  = require('domain').create();


var auth   = function(req){
	
	if(!req.session.user || !req.session.user.character || req.session.user.character.length == 0 || !req.body || !req.body.character){
		return false;
	}

	if(req.session.user.character.indexOf(req.body.character) == -1){
		return false;
	}

	return true;
}

var router = {
	GET : function(req, res, next){
		next();
	},
	POST : function(req, res, next){
		var storageDir  = __dirname + '/public/storage',
			tmpDir      = os.tmpDir(),
			character   = req.body.character,
			fileName,
			file,
			folder,
			newPath;

		domain.on('error', function(err) {
			console.log('domain ===');
			console.log(err);
			res.send(405);
		});


		if(!req.files && req.files.length == 0){
			res.send(405);
			return;
		}
		if(!auth(req)){
			res.send(401);
			return;
		}

		fileName = Object.keys(req.files)[0];
		file = req.files[fileName];
		folder = storageDir + '/' + character;
		newPath = (storageDir + '/' + character + '/' + fileName + '.jpg').replace(/\\/g, '/');

		if(!fs.existsSync(folder)){
			fs.mkdirSync(folder);
		}
		if(fs.existsSync(newPath)){
			fs.unlinkSync(newPath);
		}

		fs.rename(file.path, newPath, domain.bind(function(err){
			if(err){
				var is = fs.createReadStream(file.path),
					os = fs.createWriteStream(newPath);
				
				is.on('end', domain.bind(function (err) {
					if (!err) {
						fs.unlinkSync(file.path);
						res.json(200, { ok : true });
					}
				}));
				is.pipe(os);
			} else {
				res.json(200, { ok : true });
			}
		}))
	},
	PUT : function(req, res, next){
		this.POST.call(this, req, res, next);
	},
	DELETE : function(req, res, next){
		next();
	},
	OPTIONS : function(req, res, next){
		next();
	}
}


module.exports = function(req, res, next){

	router[req.method](req, res, next);
	
}