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
			'click #account'        : 'showAccount',
			'click a'               : 'link',
			// 'click .character'      : 'selectCharacter',
			'click #modalCancel'    : 'cancel',
			'click #modalDone'      : 'done',
			'click .refresh'        : 'refresh',
			'mouseout .accounts.on' : 'delayedHideAccount',
			'mouseover .accounts'   : 'resetTimer'
		},
		initialize: function(option){
			var self = this;
			
			this.vent     = option.vent;

			this.template = dot.template(html);
			this.model = new User();

			this.collection = new Characters();
			this.collection.on('reset', this.reset, this);

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
			var self = this;

			this.model.on('change', self.setting, this);
			self.model.fetch();
		},

		hideButton : function(){
			if(location.pathname == 'write' || location.pathname == '/write'){
				self.$('#newMoment').hide();
			} else {
				self.$('#newMoment').show();
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
				success : function (collection, data, ajax) {

					self.$('#login').hide().empty().append('Login');
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

				}
			});
		},
		reset : function(){
			this.$el.children().not('#login, .modal').remove();
			this.$('#login').show();
		},

		selectCharacter : function(e){
			var self = this;
				id = $(e.target).attr('data-id');

			this.setCharacter(
				self.collection.find(function(character){ return character.id == id }).toJSON()
			);
		},

		setCharacter : function(character){
			var self = this;

			if(!character){
				return;
			}
			// set name
			this.$('#account').empty().append(character.name).data(character);
			// set view object's attribute
			this.currentCharacter = character;

			this.$('.link').attr('href', '/posts/' + character._id);

			document.cookie = 'character=' + character._id;
		},

		showAccount : function(e){
			var self = this;
			this.$('.accounts').toggleClass('on');
			this.$('#account').toggleClass('on');
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
			if(e.target.className == 'character'){
				var targetId  = $(e.target).attr('data-id'),
					character = this.collection.get(targetId).toJSON();
				self.hideAccount();
				self.setCharacter(character);
				return;
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
			var self = this,
				newCharacterName = $('#newCharacter').val(),
				currentCharacter = this.model.get('character');

			this.newCharacter(newCharacterName, self.saveCharacter);
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
					self.$('.modal').removeClass('on');
					backbone.history.navigate('/posts/' + model.id, { trigger : true });
				}
			});
		}

	});
});
