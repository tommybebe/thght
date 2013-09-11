var express        = require('express')
	, app          = express()
	, server       = require('http').createServer(app)
	// , socketSetter = require('./module/socket')
	// , sio          = require('socket.io')
	, routes       = require('./module/route')
	, fbAuth       = require('./module/middleWare/fbAuth')
	, config       = require('./module/config/config')
	, storage      = require('./module/storage');

module.exports = function(){

	app.configure(function () {

		app.set('views', __dirname + '/view')
		.set('view engine', 'jade')
		.set('view options', {layout: false})
		.use(express.compress())
		.use(express.static(__dirname + '/public'))
		.use(express.cookieParser(config.cookieSecret))
		.use(express.session({
			secret: config.cookieSecret
			, cookie : {
				expires : false
				, maxAge  : config.maxAge
			}
			, key : 'express.sid'
		}))
		.use(express.bodyParser())
		.use('/storage', storage)
		// if req == favicon
		.use(express.favicon('./public/favicon.ico'))
		// .use(function(req, res, next) {
		// 	res.header("Access-Control-Allow-Origin", "*");
		// 	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
		// 	res.header("Access-Control-Allow-Headers", "X-Requested-With");
		// 	next();
		// });
		.use(fbAuth())
	});

	// routes set
	routes.init(app);

	// socket set
	// socketSetter.init(server);

	server.listen(config.serverPort);

};