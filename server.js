var cluster   = require('cluster'),
	numCPUs   = require('os').cpus().length,
	config    = require('./module/config/config'),
	server    = require('./was'),
	proxy     = require('./proxy'),
	optimizer = require('./optimizer');


process.env.NODE_ENV = config.env;

if(process.env.NODE_ENV == 'production'){
	
	if (cluster.isMaster) {
		
		optimizer();

		// Fork workers.
		for (var i = 0; i < numCPUs; i++) {
			cluster.fork();
		}

		cluster.on('exit', function(deadWorker, code, signal) {
			// Restart the worker
			var worker = cluster.fork();

			// Note the process IDs
			var newPID = worker.process.pid;
			var oldPID = deadWorker.process.pid;

			// Log the event
			console.log('worker '+oldPID+' died.');
			console.log('worker '+newPID+' born.');
		});

	} else {
		server();
	}

} else {
	// proxy();
	server();
}