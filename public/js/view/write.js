define(function(require){

	var $         = require('jquery'),
		backbone  = require('backbone'),
		_         = require('lodash'),
		config    = require('config/index');

	var Post      = require('model/post'),
		Character = require('model/character');

	var html = require('text!view/template/select.html'),
		dot = require('dot');

	return backbone.View.extend({

		el : '#write',
		events : {
			'click .cd-dropdown ul li' : 'findFriends',
			'click .commit' : 'commit'
		},
		initialize: function(option){

			var self = this,
				select = {
					moment : config.defaultMoment('write_momentSelect'),
					who : {
						id : 'who',
						options : [
							{ value : '-1', text : 'To', selected : true },
							{ value : 'To-Anyone', text : 'To Anyone', selected : false },
							{ value : 'To-No-one', text : 'To No one', selected : false },
							{ value : 'Find-someone-from-facebook', text : 'Find someone from facebook', selected : false }
						]
					}
				}

			this.character = new Character();

			// --
			this.selectForm    = dot.template(html);
			this.selectBackup  = this.$('#cd-dropdown').clone();

			_.bindAll(this);

			// == 
			// this.$('.moment').append(self.selectForm(select.moment));
			this.$('.who').append(self.selectForm(select.who));

			// -- 
			this.$('#comment').autosize({
				callback : function(self){
					$(self).data('rows', _getRows({ height : self.offsetHeight }));
				}
			});

			function _getRows(param){

				var rows,
					option = {
						height     : 240,
						lineHeight : 60
					};

				option = _.extend(option, param);

				option.height = Math.floor( option.height / 10 );
				option.lineHeight = option.lineHeight / 10;

				rows = parseInt(option.height / option.lineHeight);

				return rows;

			}

		},

		render: function(){
			
			var self = this,
				interval = 100;

			// --	
			$(window).on('resize', this.lazyLayout);
			// --
			// this.$('.title').fitText(2, { minFontSize: '24px' });

			this.$el.show();
			this.$( '.cd-select' ).each(function(){
				$(this).dropdown();
			});
			this.$('#comment').focus();

			_setImage();
			this.lazyLayout();

			function _setImage(){
				setTimeout(function(){
					if($('#account').data()){
						self.$('.writer')
						.css('background-image', 'url(' + $('#account').data().image.frontImage + ')' )
						.css('background-size', '100% 100%');
					} else {
						if(interval < 10000) interval += interval;
						_setImage();
					}
				}, interval);
			}

		},
		hide : function(){
			$(window).off('resize', this.lazyLayout);
			this.$('.who').children().not(':first-child').remove().end().show();
			this.$el.hide(200);
			console.log('hide write page');
		},

		lazyLayout : _.debounce(function(){
			this.calculateLayout();
		}, 300),

		calculateLayout : function(){
			this.$('#comment').css('font-size', ($('#comment').width() * 0.049) );
		},

		findFriends : function (e){
			var self = this,
				input = $(e.target).parent().parent().prev(),
				loadingPannel = this.$('.who').children(':first-child').find('span:eq(0)');

			if(input.val() == 'Find-someone-from-facebook'){

				loadingPannel.empty().append('<img src="img/loading.gif"/>');

				$.get('/api/user/findFriends', function(data){

					if(data){

						var friendsSelect = { 
							id : 'friendsSelect',
							options : []
						};

						friendsSelect.options.push({ value : '-1', text : 'Choose someone', selected : true });
						friendsSelect.options.push({ value : 'To-Anyone', text : 'To Anyone', selected : false });
						friendsSelect.options.push({ value : 'To-No-one', text : 'To No one', selected : false });

						data.data.forEach(function(friend){
							friendsSelect.options.push({ value : friend.id, text : 'to ' + friend.name, selected : false })
						});

						self.$('.who').children().hide();

						self.$('.who').append(self.selectForm(friendsSelect));
						$('#' + friendsSelect.id ).dropdown();

					} else {

					}

				}).done(function(){
					loadingPannel.text('To');
				})
			}
		},

		commit : function(){
			var self = this,
				data = {},
				user = $('#account').data(),
				auth;

			this.$('form').serializeArray().forEach(function(input){
				if(input.name == 'write_momentSelect'){
					data['moment'] = input.value;
				} else {
					data[input.name] = input.value;
				}
			});
			data.user = user;

			if(!_validate(data)){
				return;
			}

			this.model = new Post({
				owner     : user._id,
				auth      : auth,
				public    : !!(data.who == 'To-Anyone'),
				category  : data.moment,
				content   : [{
					character : {
						_id : user._id,
						name : user.name,
						image : user.image
					},
					text : encodeURIComponent(data.comment),
					date : new Date()
				}]
			});

			this.model.save(null, {
				success : function(data){
					self.$('textarea').val('');
					backbone.history.navigate('/post/' + data._id, { trigger : true });
				}
			});

			// @param
			// @param.user     != null
			// @param.moment   != null
			// @param.comment  != null
			// @param.who      != null
			function _validate(param) {

				if(!param){
					return;
				} else if(!param.user){
					$('#login').alert();
					return;
				// } else if(!param.moment || param.moment == -1){
				// 	this.$('.moment').alert();
				// 	return;
				} else if(!param.comment || param.comment == ''){
					this.$('.comment').alert();
					$('#comment').focus();
					return;
				// } else if(!param.who || param.who == -1){
				// 	this.$('.who').alert();
				// 	return;
				}

				return true;

			}
		}

	});
});
