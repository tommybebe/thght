define(function(require){

	var $          = require('jquery'),
		backbone   = require('backbone'),
		_          = require('lodash');

	var transition = function(action, option){

		var self = this;

		var _actions = {
			hide : function(){
				self.hide();
			}
		}

		return _actions[action]();

	};

	$.fn.transition = transition;

});