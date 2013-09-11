define(function(require){

	var $        = require('jquery'),
		backbone = require('backbone'),
		_        = require('lodash');

	return backbone.View.extend({
		el : '#nav',
		events : {
			'click a'   : 'link'
		},
		initialize: function(option){

		},
		render: function(data){

		},

		set : function(page){

			var self = this;

			switch (page) {
				case 'write' : 
					self.$el.show();
					break;
				case 'explore' : 
					self.$el.hide();
					break;
				case 'posts' : 
					self.$el.show();
					break;
				case 'post' : 
					self.$el.show();
					break;
				case '404' : 
					self.$el.show();
					break;
				default :
					self.$el.hide();
			}

		},

		link : function(e){
			e.preventDefault();
			backbone.history.navigate('/', { trigger : true });
		}
	});
});
