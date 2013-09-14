define(function(require){

	var $        = require('jquery'),
		backbone = require('backbone'),
		_        = require('lodash'),
		config   = require('config/index');

	var Character = require('model/character'),
		Posts     = require('collection/posts');

	var Loading  = require('view/loading');

	var html           = require('text!view/template/post.html'),
		selectTemplate = require('text!view/template/select.html'),
		dot            = require('dot');

	return backbone.View.extend({

		el : '#posts',
		events : {
			// 'click .cd-dropdown ul li' : 'changeMoment',
			'click a' : 'link',
			'click .edit .button' : 'edit'
		},

		initialize: function(option){

			var self            = this,
				defaultMoment   = config.defaultMoment('posts_momentSelect');

			defaultMoment.options[0].value = 'Moments';

			this.template       = dot.template(html);
			this.momentTemplate = dot.template(selectTemplate);

			// this.$('.moment').append(self.momentTemplate(defaultMoment));

			this.vent = option.vent;
			this.vent.on('get:auth:result', function(auth){
				self.editAuthSetting.call(self, auth);
			});

			_.bindAll(this);

		},

		render: function(_id){

			var self = this;

			this.$el.show();
			// this.$( '.cd-select' ).dropdown();

			this.collection = new Posts();
			this.collection.setKey({
				_id  : _id,
				view : 'character'
			});
			this.collection.on('add', this.add, this);
			this.collection.on('reset', this.reset, this);
			this.fetch();

			this.model = new Character(_id);
			this.model.on('change', self.setting, this);
			this.model.fetch();

			$(window).on('scroll', self.scroll);
			$('.content').on('scroll', self.scroll);

		},
		clear : function(){
			this.$('.name').text('Anonymous')
			this.$('.frontImage').css('background-image', '');
			this.$('.backImage').css('background-image', '');
		},
		reset : function(){
			this.$('.posts ul').empty();
		},
		
		hide : function(){
			$(window).off('scroll');
			$('.content').off('scroll');
			this.$el.hide();
			this.model.clear();
			this.collection.reset();
			console.log('hide posts page');
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
			this.fetch();
		},
		fetch : function(){
			this.collection.fetch({
				success : function(collection, models){
					if(models.length){
						$(window).scroll();
						$('.content').scroll();
					}
				}
			});
		},

		setting : function(data){

			var self  = this,
				data  = data.toJSON();

			if(_.isEmpty(data)){
				this.clear();
				return;
			}

			if(data.error == 'not_found'){
				backbone.history.navigate('/404', { trigger : true });
				return;
			}

			this.vent.trigger('get:auth', data._id);
			this.$('.name').empty().append(data.name + '\'s');
			
			_setImage.call(this);

			function _setImage(){
				var image = this.model.getImage();
				this.$('.edit .button').empty().text('Edit');
				this.$('.frontImage').css('background-image', 'url(' + image.frontImage + ')');
				this.$('.backImage').css('background-image', 'url(' + image.backImage + ')');
			}

		},
		editAuthSetting : function(auth){

			var self = this;

			if(!auth){
				this.$('.frontImage, .backImage').find(".edit").remove();
				// this.$('input[type="file"]').each(function(index, file){
				// 	$(file).fileupload('destroy');
				// });
				return;
			}

			if(!FormData){
				return;
			}

			if(document.getElementById('frontImage') || document.getElementById('backImage')){
				return;
			}

			this.$('.frontImage').append('<div class="edit"><div class="button">Edit</div></div><input id="frontImage" type="file" name="frontImage">');
			this.$('.backImage').append('<div class="edit"><div class="button">Edit</div></div><input id="backImage" type="file" name="backImage">');

			this.$('input[type="file"]').on('change', function(e){

				var file = this,
					side = file.id;

				$.ajax({
					url : '/storage',
					type : "DELETE",
					data : {
						character : self.model.get('_id'),
						fileName  : self.model.getImage()[file.id].split('/').pop()
					},
					beforeSend : function(){
						this.loading = new Loading();
						this.loading.render();
						this.loading.set();
					},
					complete : function(){
						this.loading.done();
					}
				}).done(function(){
					
					self.fileupload(file);

				});

			})

		},

		fileupload : function(file){
			var self        = this,
				fileInput   = file,
				side        = file.id,
				fileName    = file.id + '.' + (new Date()).getTime(),
				queryString = {
					character : self.model.get('_id'),
					fileName  : fileName
				};

			$.get('/api/storageAuth', queryString, function(data, status, res){

				var file = document.getElementById(side).files[0],
					fd = new FormData(),
					loading = new Loading();

				var xhr = new XMLHttpRequest();

				loading.render();
				
				fd.append('key', (self.model.get('_id') + '/' + fileName + '.jpg') );
				fd.append('acl', 'private');
				fd.append('Content-Type', file.type);
				fd.append('AWSAccessKeyId', data.s3Key);
				fd.append('policy', data.s3PolicyBase64);
				fd.append('signature', data.s3Signature);
				fd.append("file", file);


				xhr.upload.addEventListener("progress", function(e){
					console.log('progress', arguments);
					self.$('.' + side).find('.button').empty().append('<img src="/img/loading.gif"/>');
					loading.set(e.loaded / e.total);
				}, false);
				xhr.addEventListener("error", function(){
					console.log('error', arguments);
				}, false);
				xhr.addEventListener("abort", function(){
					console.log('abort', arguments);
				}, false);
				xhr.addEventListener("load",  function(){

					var image = self.model.get('image');
					image[side] = config.storage.domain + '/' + self.model.get('_id') + '/' + fileName + '.jpg',
					self.model.save({ image : image });
					loading.done();
				}, false);

				xhr.open('POST', config.storage.domain + '/', true); //MUST BE LAST LINE BEFORE YOU SEND 

				xhr.send(fd);

			});

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
		},

		edit : function(e){
			var self   = this,
				domain = $(e.target).parent().parent(),
				file   = domain.find('input[type="file"]');

			file.click();
		},
		changeMoment : function(){
			var self = this,
				moment = self.$('input[name="posts_momentSelect"]').val();

			this.$('.posts ul').empty();
			this.collection.models.forEach(function(post){
				if(moment == post.get('category') || moment == 'Moments'){
					self.add(post);
				}
			});
		}
	});

});
