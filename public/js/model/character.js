define(function(require){

	var $        = require('jquery'),
		backbone = require('backbone'),
		_        = require('lodash');

	var config   = require('config/index');

	// var base64   = require('plugin/base64');

	return backbone.Model.extend({
		
		idAttribute : '_id',
		url : '/api',
		db  : '/character',
		defaults : {
			image : {
				frontImage : config.characterDefaultImage.front,
				backImage  : config.characterDefaultImage.back
			}
		},

		initialize : function(character){
			var self = this;

			if(character && _.isString(character)){
				this.db += '/' + character;
			} else if(character && character._id) {
				this.db += '/' + character._id;
			}

			this.on('change:id', function(){
				self._id = self.get('id');
				self.id  = self.get('id');
			});
		},
		getImage : function(){
			var self    = this,
				images  = this.attributes.image,
				_images = {};

			Object.keys(images).forEach(function(side){
				if(config.storage.cdn && config.storage.domain){
					_images[side] = images[side].replace(config.storage.domain, config.storage.cdn);
				} else {
					_images = images;
				}
			});
			return {
				frontImage : _images.frontImage,
				backImage  : _images.backImage
			};
		}

	});

});