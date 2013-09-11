var async      = require('async'),
	css        = require('clean-css'),
	r          = require('./public/r'),
	fs         = require('fs'),
	rconfig    = {
	    baseUrl: "./public/js",
	    paths: {
			'jquery'          : 'components/jquery/jquery',
			'jquery.autosize' : 'plugin/jquery.autosize',
			'jquery.dropdown' : 'plugin/jquery.dropdown',
			'jquery.fittext'  : 'plugin/jquery.fittext',

			'jquery.ui.widget': 'plugin/jquery.ui.widget',
			'jquery.file'     : 'plugin/jquery.file',

			'jquery.alert'    : 'plugin/jquery.alert',

			'backbone'        : 'components/backbone/backbone',
			'backbone.couch'  : 'plugin/backbone.couch',
			'sync'            : 'plugin/backbone.sync',
			'underscore'      : 'components/underscore/underscore-min',
			'lodash'          : 'components/lodash/lodash',
			'es5shim'         : 'components/es5-shim/es5-shim.min',
			'es5sham'         : 'components/es5-shim/es5-sham.min',
			'moment'          : 'components/moment/moment',
			'modernizr'       : 'components/modernizr/modernizr',
			'dot'             : 'components/doT/doT.min',
			'text'            : 'plugin/text',
			'cookie'          : 'plugin/cookie'
	    },
	    shim: {
	        'backbone': {
				deps: [
					'lodash'
				],
				exports : 'Backbone'
	        },
	        'lodash': {
				exports : '_'
	        },
				'jquery.dropdown' : ['jquery'],
				'jquery.fittext'  : ['jquery'],
				'jquery.autosize' : ['jquery'],
				'jquery.ui.widget': ['jquery'],
				'jquery.file'     : ['jquery'],
				'jquery.alert'    : ['jquery']
	    },
	    name: "main",
	    out: "./public/js/main-min.js"
	};

module.exports = function(callback){
	async.auto({
		js : function(cb){
			r.optimize(rconfig, function(res){
				console.log('js optimize done');
				cb();
			});
		},
		css : function(cb){
			var sourcePath = './public/css/common.css',
				targetPath = './public/css/common-min.css',
				source     = fs.readFileSync(sourcePath, 'utf8');

			fs.writeFile(targetPath, css.process(source), function(err){
				if(err){
					cb(err);
					return;
				}
				console.log('css optimize done');
				cb();
			});
		}
	}, function(err, data){
		if(err){
			console.log('optimize error : ' + err);
			return;
		}
		if(callback) callback();
	});
}