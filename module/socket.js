var sio = require('socket.io');

module.exports = {
	
	// server = http.createServer(app)
	// store = new RedisStore(redis options)
	init : function(server){

		var self = this, 
			io = sio.listen(server);

		io
			.configure('development', function (){
				io.set('log level', 2);
			})
			.configure('production', function (){
				io
				.enable('browser client minification')  // send minified client
				.enable('browser client etag')          // apply etag caching logic based on version number
				.enable('browser client gzip')          // gzip the file
				.set('log level', 1);
			});

		// global connection
		io.sockets.on('connection', function (socket) {

			socket.emit('message', { 'hi' : 'there' });
			
			socket.on('ping', function (data) {
				console.log(data);
				socket.emit('message', 'pong');
			});

			socket.on('error', function (data){
				console.log("socket error");
			});

			socket.on('disconnect', function () {
				console.log('socket disconnected');
			});

		});
	}
};