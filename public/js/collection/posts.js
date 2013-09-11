define(function(require){

	var $        = require('jquery'),
		backbone = require('backbone'),
		_        = require('lodash'),
		config   = require('../config/index');

	var Post     = require('model/post');


	var _Posts    = backbone.Collection.extend({

		model: Post,
		url : '/api',
		db  : '/post',
		view : {
			defaultUri    : '/_design/list/_view',
			viewName : {
				character : '/character',
				category  : '/category',
				default   : '/all'
			}
		},
		initialize: function(_id){
			if(_id){
				this.key = _id;
			}
		}
	});

	var Posts    = backbone.Collection.extend({

		model: _Posts,
		initialize: function(_id){
		},
		setKey : function(param){
			this.key  = param._id;
			this.view = param.view;
		},
		fetch : function(options){
			var self  = this,
				page  = this.length,
				opts  = {},
				_post = new _Posts(self.key);
				
			opts  = {
				skip  : config.itemPerPage * page,
				limit : config.itemPerPage,
				success : function(collection, models, xhr){
					if(models.length) self.push(_post);
					if(options && options.success) options.success(collection, models, xhr);
				}
			};

			if(this.view){
				if(!opts.filter) opts.filter = {};
				opts.filter.view = this.view;
			}
			_post.fetch(opts);
		},
		_prepareModel : function(data){
			return data;
		}
	});

	return Posts;
});
