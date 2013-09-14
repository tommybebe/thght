var _          = require('lodash'),
	config     = require('./config/config'),
	request    = require('request'),
	api        = require('./api'),
	fb         = require('./fb');

	fakeUser = {
		id : 'f583a27fe35347bca6df2e4c810005f4',
		character : [
			{
				_id : 'f583a27fe35347bca6df2e4c8100122a',
				name : 'gorilla'
			},
			{
				_id : 'f583a27fe35347bca6df2e4c81001a81',
				name : 'monkey'
			}
		]
	};

module.exports = {
	init : function (app) {
		
		getDomain = function(req){
				var port;

				if(config.env == 'development'){
					port = ':' + config.port;
				} else {
					port = '';
				}
				return req.protocol + '://' + req.host + port;
		},

		index = function(req, res){
			res.render('index', { 
				title : 'title',
				user : req.session.user
			});
		},

		storage = function(req, res){
			var params = req.params;
			console.log(params);
		},

		_api = function(req, res){
			var url = config.apiUrl + req.url.replace('/api', ''),
				param = {
					url      : url,
					method   : req.method.toLowerCase(),
					json     : true,
					encoding : 'utf-8'
				};

			if(req.body && !_.isEmpty(req.body)){
				param.body = req.body;
			}

			request(param , function(err, data, body){

				var val = body;

				if(err){
					console.log(err);
					return;
				}

				if(val && val.rows){
					val.rows.forEach(function(row, i){
						if(!row.deleted || (row.value && !row.value.deleted )){
							val.rows[i] = row.doc || row.value;
						}
					});
					val = val.rows;
				}

				if( (req.url.match('/api/user') && val.ok) && (req.method == 'PUT' || req.method == 'POST') ){
					req.session.user = _.extend(_.cloneDeep(req.session.user), req.body);
					req.session.save(function(err, data){
						res.json(val);
					});
				} else {
					res.json(val);
				}

				(function(req, body){
					process.nextTick(function(){
						api.updateNotification(req, body);
					});
				})(req, body);
				
			});

		},

		login = function(req, res) {
			var url = req.param('url'),
				authLink = fb.getAuthorizeUrl({ redirect_uri : url });

			res.redirect(authLink);
		},
		logout = function(req, res){
			req.session.user = null;
			req.session.token = null;
			req.session.save();
			res.redirect('/');
		},

		session = function(req, res){
			if(req.session && req.session.user){
				res.json(req.session.user);
			} else {
				res.json(null);
			}
		},
		findFriends = function(req, res){

			if(!req.session || !req.session.token){
				res.json(null);
				return;
			}
			
			fb.apiCall('get', '/me/friends', { access_token : req.session.token }, function(err, response, data){
				if(err || response.statusCode != 200){
					res.json(null);
				} else {
					res.json(data);
				}
			});
		};

		app.get('/test', function(req, res){
			res.json({'world' : 'hello GET'});
		});
		app.post('/test', function(req, res){
			res.json({'world' : 'hello POST'});
		});
		app.put('/test', function(req, res){
			res.json({'world' : 'hello PUT'});
		});

		app.get('/ping', function(req, res){
			res.send('pong');
		});

		// index page
		app.get('/', index);
		app.get('/explore', index);
		app.get('/posts/:_id', index);
		app.get('/post/:_id', index);
		app.get('/write', index);

		// login, logout
		app.get('/login', login);
		app.get('/logout', logout);
		
		// api
		app.get('/api', _api);
		app.get('/api/storageAuth', api.storageAuth);
		app.get('/api/user', session);
		app.get('/api/user/findFriends', findFriends);
		app.get('/api/*', _api);
		app.post('/api', _api);
		app.post('/api/*', _api);
		app.put('/api', _api);
		app.put('/api/*', _api);
		app.delete('/api', _api);
		app.delete('/api/*', _api);

		app.get('/404', index);

		// 404
		app.get('*', index);
	}
};
