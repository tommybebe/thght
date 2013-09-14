// define([
// 	'jquery',
// 	'lodash',
// 	'backbone',
// 	'view/auth',
// 	'view/nav',
// 	'view/write',
// 	'view/explore',
// 	'view/posts',
// ], function($, _, backbone, AuthView, NavView, WriteView, ExploreView, PostsView){
define(function(require){

	var	$                   = require('jquery'),
		_                   = require('lodash'),
		backbone            = require('backbone'),
		sync                = require('sync'),

		AuthView            = require('view/auth'),
		NavView             = require('view/nav'),
		WriteView           = require('view/write'),
		ExploreView         = require('view/explore'),
		PostsView           = require('view/posts'),
		PostView            = require('view/post'),
		E404View            = require('view/404');

	var globalEvents        = _.extend({}, backbone.Events);
		
		Router              = backbone.Router.extend({
		routes: {
			
			''              : '_router',
			'write'         : '_router',
			'explore'       : '_router',
			'posts/:_id'    : '_router',
			'post/:_id'     : '_router',
			'404'           : '_router',
			'*actions'      : '404'
		},

		initialize : function(){

			var self = this;

			_.bindAll(this);

			backbone.sync = sync;

			this.views = {
				auth        : new AuthView({ vent : globalEvents }),
				nav         : new NavView({ vent : globalEvents }),
				write       : new WriteView({ vent : globalEvents }),
				explore     : new ExploreView({ vent : globalEvents }),
				posts       : new PostsView({ vent : globalEvents }),
				post        : new PostView({ vent : globalEvents }),
				404         : new E404View(),
				current     : function(){
					var current = $('.page:visible').attr('id');
					if(!current){
						return { hide : function(){} };
					}
					return self.views[current];
				}
			};

			this.views.auth.render();
			this.views.nav.render();

		},

		_router : function(id){
			var path = backbone.history.fragment.split('/')[0];

			if(path == ""){
				path = 'explore';
			}
			this.views.current().hide();
			this.views[path].render(id);
			this.views.nav.set(path);
		},

		// write : function(){
		// 	console.log('write');

		// 	this.views.current().hide();
		// 	this.views.write.render();
		// 	this.views.nav.set('write');
		// },
		
		// explore : function(){
		// 	console.log('explore');

		// 	this.views.current().hide();
		// 	this.views.explore.render();
		// 	this.views.nav.set('explore');
		// },

		// posts : function(id){
		// 	console.log('posts');

		// 	this.views.current().hide();
		// 	this.views.posts.render(id);
		// 	this.views.nav.set('posts');
		// },

		// post : function(id){
		// 	console.log('post');

		// 	this.views.current().hide();
		// 	this.views.post.render(id);
		// 	this.views.nav.set('post');
		// },

		'404' : function(){
			this.views.current().hide();
			this.views.e404.render();
			this.views.nav.set('404');
		},

		defaultAction : function(){
			// ????
			console.log('default');
		}

	}),

	initialize = function(){

		var router = new Router,
			pushState = !!window.history.pushState;


		// override getHash function
		// for facebook auth callback hash, "#_=_" thing.
		// when we have that weird "_=_", just replace to blank
		if(window.location.hash == '#_=_'){
			history.pushState('', document.title, window.location.pathname)
			window.location.hash = ''; // for older browsers, leaves a # behind
			window.history.pushState('', document.title, window.location.pathname); // nice and clean
		}
		// if browser dont have pushstate function, set hasChange false, pushState false.
		backbone.history.start({ hashChange: pushState, pushState : pushState });
	}

	return {
		initialize : initialize
	}

});
