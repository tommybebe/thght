var _       = require('lodash'),
	domain  = require('domain').create(),
	request = require('request'),
	s3p     = require('s3policy'),
	config  = require('./config/config');


var auth   = function(req){
	if(!req.session.user || !req.session.user.character || req.session.user.character.length == 0 || !req.query || !req.query.character){
		return false;
	}
	if(req.session.user.character.indexOf(req.query.character) == -1){
		return false;
	}
	return true;
},

updateNotification = function(req, model){

	var _update = {
		post : {
			get : _postViewed,
			put : _postAdded,
			post : function(){},
			delete : function(){},
			option : function(){},
		}
	}

	if(req.url.match('/api/post')){

		_update.post[req.method.toLowerCase()](req, model);

	}

	function _getCharacter(req, id, callback){
		request({
			url : config.apiUrl + '/character/' + id,
			method : 'GET',
			json     : true,
			encoding : 'utf-8'
		}, callback);
	}

	function _postViewed(req, model){

		if(!req.session || !req.session.user || !req.session.user.character){
			return;
		}

		if(req.session.user.character.indexOf(model.owner) == -1){
			return;
		}

		_getCharacter(req, model.owner, function(err, data, body){

			var item,
				currentPostId = req.params[0].split('/').pop();

			if(err || !data || !body || !body.notification){
				return;
			}
			
			item = _.find(body.notification, { _id : currentPostId });

			if(!item || item.unread === 0){
				return;
			}
			
			item.unread = 0;

			updateParam = {
				url      : config.apiUrl + '/character/' + model.owner,
				method   : 'PUT',
				json     : true,
				encoding : 'utf-8',
				body     : body
			}

			request(updateParam);
		});
	}

	function _postAdded(req, model){

		var owner = req.body.owner;

		_getCharacter(req, owner, function(err, data, body){
			
			var item, updateParam;

			if(err || !data || !body || !body._id){
				return;
			}

			if(req.session && req.session.user && req.session.user.character && req.session.user.character.indexOf(owner) != -1){
				return;
			}

			if(!body.notification){
				body.notification = [{
					_id    : req.body._id,
					unread : 1
				}];
			} else {

				item = _.find(body.notification, { _id : req.body._id });

				if(!item){
					body.notification.push({
						_id    : req.body._id,
						unread : 1
					});
				} else {
					item.unread += 1;
				}
			}

			updateParam = {
				url      : config.apiUrl + '/character/' + req.body.owner,
				method   : 'PUT',
				json     : true,
				encoding : 'utf-8',
				body     : body
			}

			request(updateParam);
		});
	}
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
	},
	updateNotification : updateNotification
}