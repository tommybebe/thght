var _      = require('lodash'),
	domain = require('domain').create(),
	s3p    = require('s3policy'),
	config = require('./config/config');


var auth   = function(req){
	if(!req.session.user || !req.session.user.character || req.session.user.character.length == 0 || !req.query || !req.query.character){
		return false;
	}
	if(req.session.user.character.indexOf(req.query.character) == -1){
		return false;
	}
	return true;
}

domain.on('error', function(err) {
	console.log('domain ===');
	console.log(err);
});

module.exports = {
	storageAuth : function(req, res){

		if(!auth(req)){
			res.send(401);
			return;
		}

		var myS3Account = new s3p(config.s3.key, config.s3.secret);
		var policy  = myS3Account.writePolicy(req.query.character + '/' + req.query.fileName + '.jpg', config.s3.bucket, 60, 10);

		res.json(policy);
	}
}