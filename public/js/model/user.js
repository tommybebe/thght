define(function(require){

	var $        = require('jquery'),
		backbone = require('backbone'),
		_        = require('lodash');

	return backbone.Model.extend({
		
		idAttribute : '_id',
		url : '/api',
		db : '/user',
		defaults : {
			character : []
		},

		initialize : function(option){
			var self = this;

			this.on('change:_id', function(){
				if(self.id){
					self.db += '/' + self.id;
				}
			});
		}
	});

});