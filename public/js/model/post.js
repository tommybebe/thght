define(function(require){

	var $        = require('jquery'),
		backbone = require('backbone'),
		_        = require('lodash'),
		moment   = require('moment');

	var sampleText = 'We broke up because I believed that I could change you. I believed that I was the one that you would love as much as I loved you. We broke up because I loved you more.';

	return backbone.Model.extend({
		
		idAttribute : '_id',

		url : '/api',
		db  : '/post',

		// get, set override
		get : function (attr){
			var encoded = _.cloneDeep(this.attributes[attr]);

			if(attr == 'content' && _.isArray(encoded) && encoded.length){
				encoded.forEach(function(content, index){
					content.text = decodeURIComponent(content.text).replace(/\r\n/g, '<br/>').replace('/\n/g', '<br/>');
					content.date = moment(content.date).fromNow();
				});
			}
			return encoded;
		},

		getCoverContent : function(){
			var content = _.cloneDeep(this.attributes.content[0]);


			content.text    = decodeURIComponent(content.text).replace(/\s{2,}/g, ' ');
			content.date    = moment(content.date).fromNow();
			content._id     = this.id;
			content._length = this.attributes.content.length;

			return content;
		},

		// set : function(key, val, options){

		// 	if(key && key.content && _.isArray(key.content)){
				
		// 		key.content.forEach(function(content, index){
		// 			if(content.text){
		// 				key.content[index].text = encodeURIComponent(content.text);
		// 			}
		// 		});

		// 	} else if(key == "content" && _.isArray(val)){
				
		// 		val.forEach(function(content, index){
		// 			if(content.text){
		// 				val[index].text = encodeURIComponent(content.text);
		// 			}
		// 		});
		// 	}

		// 	return backbone.Model.prototype.set.call(this, key, val, options);
		// },

		initialize : function(){
			var self = this;

			this.on('change:id', function(){
				self._id = self.get('id');
			});

		},

		init : function(_id){
			if(_id && _.isString(_id)){
				this.db += '/' + _id;
			}
		}

	});

});