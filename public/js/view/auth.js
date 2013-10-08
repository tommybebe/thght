define(function(require){

	var $          = require('jquery'),
		backbone   = require('backbone'),
		_          = require('lodash'),
		config     = require('config/index'),
		cookie     = require('cookie');

	var Progress   = require('view/loading');

	var User       = require('model/user'),
		Character  = require('model/character'),
		Characters = require('collection/characters');

	var html = require('text!view/template/auth.html'),
		dot = require('dot');

	return backbone.View.extend({


		el : '#auth',
		events : {
			// 'click #account'        : 'showAccount',
			'click .closePanel'     : 'closePanel',
			'click a'               : 'link',
			// 'click .character'      : 'selectCharacter',
			'click #modalCancel'    : 'cancel',
			'click #modalDone'      : 'done',
			'click .refresh'        : 'refresh',
			'click .setting'        : 'openPanel',
			'mouseout .accounts.on' : 'delayedHideAccount',
			'mouseover .accounts'   : 'resetTimer',
			'mouseleave .panel.on'  : 'closePanel'
		},
		initialize: function(option){
			var self = this;
			
			this.vent     = option.vent;

			this.template = dot.template(html);

			this.model = new User();
			this.model.on('change', this.setting, this);

			this.collection = new Characters();
			this.collection.on('reset', this.reset, this);
			this.collection.on('add', this.eventSet, this);

			this.currentCharacter = null;

			_.bindAll(this);

			this.vent.on('get:auth', function(_id){
				if(!self.model.id){
					self.listenTo(self.model, 'change', function(model){
						self.vent.trigger('get:auth:result', !(self.model.get('character').indexOf(_id)==-1));
					});
				} else {
					self.vent.trigger('get:auth:result', !(self.model.get('character').indexOf(_id)==-1));
				}
			});

			this.vent.on('get:character', function(callback){
				if(!self.model.id){
					self.listenTo(self.model, 'change', function(model){
						callback(self)
					});
				} else {
					callback(self);
				}
			});

		},

		render: function(){
			this.model.fetch();
		},

		// location changed, auth model/collection fetch
		set : function(path, _id){
			var self  = this;
				_path = {

				// if user == post writer, update unread count
				post : function(_id){

					var matched = self.collection.filter(function(character){
						if(character && character.attributes.notification){
							return _.find(character.attributes.notification, function(noti){
								return noti._id == _id && noti.unread != 0;
							});

						} else {
							return false;
						}
					});

					if(matched.length){
						matched.forEach(function(character){
							_.delay(function(){
								character.fetch();
							}, 1000);
						});
					}
				}
			};

			if(_path[path]){
				_path[path](_id);
			}
		},
		eventSet : function(character){
			var self = this;
			character.on('change', function(){
				self.updateHTML();
			});
		},

		hideButton : function(){
			if(location.pathname == 'write' || location.pathname == '/write'){
				self.$('#newPost').hide();
			} else {
				self.$('#newPost').show();
			}
		},

		setting : function(){
			var self = this,
				character = self.model.get('character');

			this.$('#login').empty().append('<img src="/img/loading.gif"/>');

			self.vent.trigger('loginCharacters', character);

			// welcome to new user
			if(character.length == 0){
				self.$('#login').hide().empty().append('Login');
				self.$el.append(self.template());
				self.newCharacterFormOpen();
				return;
			}

			this.collection.reset();
			this.collection.setKey(self.model.get('character'));
			this.collection.fetch({
				success : self.updateHTML
			});
		},

		updateHTML : _.debounce(function(){
			var self = this,
				data = self.collection.toJSON();

			_.each(data, function(character){ 
				character.unread = 0;
				character.unreadPost;
				if(character.notification){ 
					character.notification.forEach(function(notification){ 
						if(notification.unread > 0){
							character.unread     += notification.unread;
							character.unreadPost  = notification._id;
						}
					});
				}
			});

			self.$('#login').hide().empty().append('Login');
			self.$('#loginUser').remove();
			self.$el.append(self.template(data));

			if(cookie.character){
				var cookieCharacter = _.find(data, function(character){
					return character._id == cookie.character;
				});
				if(cookieCharacter){
					self.setCharacter(cookieCharacter);
					return;
				}
			}
			if(!self.currentCharacter){
				self.setCharacter(data[data.length-1]);
			}

		}, 100),
		
		setCharacter : function(character){
			var self        = this,
				img         = $('<img src="' + character.image.frontImage + '"/>'),
				unreadCount = this.collection.getUnreadCount(),
				totalUnread = '',
				unread      = '';

			if(unreadCount){
				totalUnread = $('<div class="unread">' + unreadCount + '</div>');
			}
			if(character.unread && character.unreadPost){
				unread      = $('<a class="unread" href="/post/' + character.unreadPost + '">' + character.unread + '</a>');
			}

			this.$('#account').empty().attr('href', '/posts/' + character._id)
			.append(img).append(unread).data(character);

			this.$('.setting').append(totalUnread);


			// set view object's attribute
			this.currentCharacter = character;

			this.$('.link').attr('href', '/posts/' + character._id);

			document.cookie = 'character=' + character._id + ';path=/';
		},

		reset : function(){
			this.$('#loginUser').remove();
			this.$('#login').show();
		},

		selectCharacter : function(e){
			var self = this;
				id = $(e.target).attr('data-id');

			this.setCharacter(
				self.collection.find(function(character){ return character.id == id }).toJSON()
			);
		},

		showAccount : function(e){
			var self = this;
			// this.$('.accounts').toggleClass('on');
			// this.$('#account').toggleClass('on');
			this.$('.panel').removeClass('off');
			this.$('.panel').addClass('on');
		},
		openPanel : function(){
			this.$('.panel').removeClass('off');
			this.$('.panel').addClass('on');
		},
		closePanel : function(){
			this.$('.panel').removeClass('on');
			this.$('.panel').addClass('off');
		},
		hideAccount : function(){
			this.$('.accounts').removeClass('on');
			this.$('#account').removeClass('on');
		},
		delayedHideAccount : function(e){
			this.timer = setTimeout(this.hideAccount, 2000);
		},
		resetTimer : function(){
			var self = this;
			clearTimeout(self.timer);
		},

		link : function(e){
			var self = this;

			e.preventDefault();

			switch (e.target.id){
				case 'newCharacterFormOpen' : 
					this.newCharacterFormOpen();
					return;
					break;
				case 'login' : 
					this.login();
					return;
					break;
				case 'logout' : 
					this.logout();
					return;
					break;
				default : 
					break;
			}
			if(e.currentTarget.parentNode.className == 'character' && !e.target.className.match('unread')){
				var targetId  = $(e.currentTarget).attr('data-id'),
					character = this.collection.get(targetId).toJSON();
				
				if(character) self.setCharacter(character);
			}
			backbone.history.navigate(e.target.pathname || e.target.parentElement.pathname, { trigger : true });
		},

		login : function(){
			(new Progress()).render().set();
			$('#login').empty().addClass('loading');//append('<img src="/img/loading.gif"/>');
			window.location = '/login?url=' + encodeURIComponent(location.href);
			return;
		},
		logout : function(){
			window.location = '/logout';
			return;
		},

		newCharacterFormOpen : function(){
			var self = this;
			setTimeout(function(){
				$('#newCharacter').val(config.newName()).focus();
			}, 1);
			this.$('.modal').addClass('on').find('.back').on('click', function(){
				self.$('.modal').removeClass('on');
			});
		},
		refresh : function(){
			this.$('#newCharacter').val(config.newName()).focus();
		},
		cancel : function (e) {
			this.$('.modal').removeClass('on');
		},
		done : function(){
			var self             = this,
				input            = $('#newCharacter'),
				newCharacterName = input.val();

			if(!newCharacterName || newCharacterName == ''){
				input.alert();
				return;
			}

			this.$('#newCharacter').val('');
			this.newCharacter(newCharacterName, self.saveCharacter);

			if(this.loading) delete this.loading;
			this.loading = new Progress();
			this.loading.render().set();
		},
		newCharacter : function(name, callback){

			var newCharacter = new Character();

			newCharacter.save({ 'name' : name }, {
				error: function(model, error) {
					console.log('error', arguments);
				},
				success: callback
			});
		},
		saveCharacter : function(model){
			var self = this;
				character = this.model.get('character');
			
			character.push(model.id);

			this.model.save({ 'character' : character }, {
				success : function(){
					self.loading.done();
					self.$('.modal').removeClass('on');
					backbone.history.navigate('/posts/' + model.id, { trigger : true });
				}
			});
		}

	});
});
