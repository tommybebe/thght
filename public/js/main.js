require.config({
	baseUrl: '/js',
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
		// 'underscore'      : 'components/underscore/underscore-min',
		'underscore'      : 'components/underscore/underscore-min',
		'lodash'          : 'components/lodash/lodash',
		'es5shim'         : 'components/es5-shim/es5-shim.min',
		'es5sham'         : 'components/es5-shim/es5-sham.min',
		'moment'          : 'components/moment/moment',
		'modernizr'       : 'components/modernizr/modernizr',
		'dot'             : 'components/doT/doT.min',
		'text'            : 'plugin/text',
		'cookie'          : 'plugin/cookie'
	}
});

require([
	'jquery', 'lodash', 'modernizr', 'backbone',
	'router',
	'es5shim', 'es5sham',
	'jquery.dropdown', 'jquery.fittext', 'jquery.autosize', 
	'jquery.file',
	'jquery.alert',
	'cookie'
], function($, _, modernizr, backbone, router){
	
	router.initialize();

});
