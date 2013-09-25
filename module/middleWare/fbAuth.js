var _         = require('lodash'),
	async     = require('async'),
	config    = require('../config/config'),
	request   = require('request'),
	fb        = require('../fb');

function getDomain(req){
	var port;

	if(config.env == 'production' || config.serverPort == 80){
		port = '';
	} else {
		port = ':' + config.serverPort;
	}
	return req.protocol + '://' + req.host + port;
}

function loginCheck(user, callback){
	var domain = 'http://' + config.domain + ':' + config.serverPort,
		apiUri = domain + '/api/user/_design/list/_view/fbid?key=%22' + user.id + '%22';

	request({
		method : 'GET',
		uri    : apiUri,
		json   : true
	}, function(err, res, data){

		if(err){
			callback(err);
			return;
		}
		// welcome to new user.
		if(!data || data.length === 0){

			var newUser = {
					character : [],
					fbid      : user.id,
					name      : user.name
				};
			
			request({
				method : 'POST',
				uri    : domain + '/api/user/',
				json   : true,
				body   : newUser
			}, function(err, res, body){
				newUser._id = body.id;
				newUser._rev = body._rev;
				callback(null, newUser);
			});
			return;
		}
		callback(null, data[0]);

	});
}

module.exports = (function(){
	return function(req, res, next){

		var code = req.param('code'),
			auth = fb;

		if(code){

			async.auto({
				// get token with code value from facebook
				getToken : function(callback){
					// callback(error, access_token, refresh_token, results);
					auth.getAccessToken({
						code:code, 
						redirect_uri : getDomain(req) + req.path
					}, callback);
				},
				// request user info
				getUser : ['getToken', function(callback, data){
					// callback(error, response, parsed);
					auth.apiCall('get', '/me', {access_token:data.getToken[0]}, callback);
				}],
				// sign in
				login : ['getUser', function(callback, data){

					loginCheck(data.getUser[1], callback);

				}],
				// save token in session
				sessionsave : ['getUser', 'login', function(callback, data){
					
					// add token.
					req.session.token = data.getToken[0];

					// add user data 
					req.session.user = data.login;

					// added user data dont have picture, because db dont save picture.
					// just save temporarily for only session
					req.session.user.picture = "https://graph.facebook.com/"+data.getUser[1].id+"/picture";
					
					// done. save.
					req.session.save(callback);
				}]
			}, function(err, data){
				// when we have error, then just next with code param.
				if(err){
					req.error = req.error || {};
					req.error.fbAuthErr = err;
					console.log(req.error);
					next(null);
				} else {
					// success, redirect for drop code param
					res.redirect(req.path);
				}
			});
		} else {
			next(null);
		}
		
	}
});