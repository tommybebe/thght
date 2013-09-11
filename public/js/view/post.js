define(function(require){

	var $        = require('jquery'),
		backbone = require('backbone'),
		_        = require('lodash');

	var Post     = require('model/post');

	var html = require('text!view/template/posts.html'),
		dot = require('dot');

	return backbone.View.extend({

		el : '#post',
		events : {
			'click a'              : 'link',
			'click .add'           : 'addComment',
			'click .cancel.button' : 'cancel',
			'click .commit.button' : 'done'
		},
		initialize: function(option){

			this.template = dot.template(html);
			this.vent     = option.vent;

		},
		render: function(_id){
			var self = this;

			this.$el.show();
			this.model = new Post();
			this.model.init(_id);
			this.model.fetch();
			this.model.on('change', self.setPage, this);

		},
		hide : function(){
			this.$el.hide();
			if(this.model){
				this.model.clear();
			}
			console.log('hide post page');
		},

		addComment : function(){
			var self = this,
				character = $('#account').data();

			if(!character){
				$('#login').alert();
				return;
			}

			this.$('.add').addClass('on').empty().css('background-image', 'url(' + character.image.frontImage + '?' + (new Date()).getTime() + ')');

			this.$('.writeForm').show().addClass('on');
			this.$('textarea').focus();
			this.$('textarea').autosize();
		},

		link : function(e){
			e.preventDefault();
			if(!e.target.pathname){
				backbone.history.navigate($(e.target).parent().attr('href'), { trigger : true });
				return;
			}
			backbone.history.navigate(e.target.pathname, { trigger : true });
		},

		clear : function(){
			this.$('.timeline ul').empty();
		},
		setPage : function(model){

			var self = this,
				data = model.toJSON(),
				add  = $(document.createElement('li')),
				content;

			if(!model.id){
				this.clear();
				return;
			}
			if(data.error){
				backbone.history.navigate('/404', { trigger : true });
				return;
			}

			content = model.get('content');

			this.$('.moment').empty().append('The Moment of ' + (data.category || ''));
			this.$('ul').empty().append(self.template(content));
			this.$('ul').append(add.addClass('add').append('<i class="icon-plus"></i>'));

		},


		cancel : function(){
			this.$('.add').removeClass('on').append('<i class="icon-plus"></i>').css('background-image','');
			this.$('textarea').val('');
			this.$('.writeForm').hide().removeClass('on');
		},
		done : function (){
			var self = this,
				user = $('#account').data(),
				text = this.$('textarea').serializeArray()[0].value,
				content = this.model.attributes.content;

			if(!user || !user._id || !user.name){
				$('#login').alert();
				return;
			}
			if(text == ''){
				$('.writeForm .comment').alert();
				return;
			}

			this.$('.add').addClass('loading');
			this.$('.writeForm').hide().removeClass('on');

			// content.forEach(function(doc, index){
			// 	content[index].text = decodeURIComponent(doc.text);
			// });

			content.push({
				character : {
					_id : user._id,
					name : user.name,
					image : user.image
				},
				text : encodeURIComponent(text),
				date : new Date()
			});

			this.model.save({ 'content' : content }, {
				success : function(){
					self.$('textarea').text('');
				}
			});
		}
	});

});
