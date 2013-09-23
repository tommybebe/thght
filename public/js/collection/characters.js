define(function(require){

	var $        = require('jquery'),
		backbone = require('backbone'),
		_        = require('lodash');

	var Character     = require('model/character');

	return backbone.Collection.extend({

		model: Character,
		url : '/api',
		db  : '/character',
		view : {
			defaultUri    : '/_all_docs?include_docs=true'
		},
		methodMap : {
			'create' : 'POST',
			'update' : 'PUT',
			'delete' : 'DELETE',
			'read'   : 'POST'
		},
		initialize: function(){
		},
		setKey : function(key){
			this.key = key;
		},
		getUnreadCount : function(){
			var self  = this,
				count = 0;

			this.each(function(character){
				var noti = character.get('notification');
				if(noti){
					noti.forEach(function(notification){
						if(notification.unread != 0){
							count += notification.unread;
						}
					});
				}
			});

			return count;
		}

	});
});
