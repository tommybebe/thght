var _       = require('lodash'),
	config  = require('./config/config'),
	knox    = require('knox'),
	domain  = require('domain').create();

var s3      = knox.createClient({
	key     : config.s3.key,
	secret  : config.s3.secret,
	bucket  : config.s3.bucket
});

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
		next();
	},
	PUT : function(req, res, next){
		next();
	},
	DELETE : function(req, res, next){
		var path;

		if(!auth(req)){
			res.send('error');
			return;
		}

		path = '/' + req.body.character + '/' + req.body.fileName;

		s3.deleteFile(path, function(err, r){
			res.send('ok');
		});

	},
	OPTIONS : function(req, res, next){
		next();
	}
}


module.exports = function(req, res, next){

	router[req.method](req, res, next);
	
}