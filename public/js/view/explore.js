// define([
// 	'jquery',
// 	'lodash',
// 	'Backbone',
// 	'collection/posts',
// 	'model/post',
// 	'text!view/template/select.html',
// 	'dot'
// ], function($, _, backbone, Posts, Post, html, dot){

define(function(require){

	var $        = require('jquery'),
		backbone = require('backbone'),
		_        = require('lodash'),
		config   = require('config/index');

	var Posts    = require('collection/posts');

	var selectTemplate = require('text!view/template/select.html'),
		html = require('text!view/template/post.html'),
		dot = require('dot');


	return backbone.View.extend({


		el : '#explore',
		events : {
			// 'click .cd-dropdown ul li' : 'getMoment',
			'click a' : 'link'
		},
		initialize: function(option){

			var self = this,
				select = config.defaultMoment('explore_momentSelect');
				select.options[0].value = 'Moments';

			this.template = dot.template(html);

			this.collection = new Posts();
			this.collection.on('add', this.add, this);
			this.collection.on('reset', this.reset, this);

			this.posts = {};

			// --
			// this.selectForm = dot.template(selectTemplate);
			// this.$('.moment').append(self.selectForm(select));

			_.bindAll(this);

		},
		render: function(data){
			var self = this;

			this.$el.show().addClass('on');
			// this.$( '.cd-select' ).dropdown();

			if(!this.collection.length){
				this.fetch();
			}
			$(window).on('scroll', self.scroll);
			$('.content').on('scroll', self.scroll);

		},
		hide : function(){
			$(window).off('scroll');
			$('.content').off('scroll');
			this.$el.hide(200);
			console.log('hide explore page');
		},

		fetch : function(filter){

			var self = this;

			if(!filter) filter = {};

			this.collection.reset();

			this.collection.fetch({ 
				filter : filter,
				success : function(collection, models) {
					if(models.length){
						$(window).scroll();
						$('.content').scroll();
					}
				}
			});
		},
		scroll : _.debounce(function(e){
			var bodyHeight    = this.$('.posts').height(),
				windowHeigtht = $(window).height(),
				scrollTop     = $(e.currentTarget).scrollTop();

			if(bodyHeight <= (windowHeigtht + scrollTop + 50)){
				this.more();
			}
		}, 100),
		more : function(){
			this.collection.fetch();
		},

		reset : function(){
			this.$('.posts ul').empty();
		},
		add : function(posts){
			var self = this;

			posts.forEach(function(post){
				self.$('.posts ul').append(self.template(post.getCoverContent()));
			});
		},

		link : function(e){
			e.preventDefault();
			if(e.target.parentElement.pathname){
				backbone.history.navigate(e.target.parentElement.pathname, { trigger : true });
			} else {
				backbone.history.navigate(e.target.pathname, { trigger : true });
			}
		}

		// legacy code for category
		// getMoment : function(){
		// 	var self = this,
		// 		view = 'category',
		// 		moment = this.$('input[name="explore_momentSelect"]').val();
		// 	if(moment == 'Moments' || !moment){
		// 		moment = null;
		// 		view   = 'default';
		// 	}
		// 	this.collection.key = moment;
		// 	this.fetch({ 
		// 		view : view
		// 	});
		// },

	});
});
