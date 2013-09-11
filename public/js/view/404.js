define(function(require){

	var $        = require('jquery'),
		backbone = require('backbone'),
		_        = require('lodash');

	return backbone.View.extend({
		el : '#notFound',
		events : {
			'click a'   : 'link'
		},
		initialize: function(option){

		},
		render: function(data){
			this.$el.show();
		},

		hide : function(page){
			this.$el.hide();
		},

		link : function(e){
			e.preventDefault();
			backbone.history.navigate(e.target.pathname, { trigger : true });
		}
	});
});
