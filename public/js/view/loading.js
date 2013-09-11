define(function(require){

	var $        = require('jquery'),
		backbone = require('backbone'),
		_        = require('lodash');

	return backbone.View.extend({
		tagName : 'div',
		events : {
			'click a'   : 'link'
		},
		initialize: function(option){
			this.el.className = 'progressBar';

			this.bar1 = $('<div class="bar1"></div>');
			this.bar2 = $('<div class="bar2"></div>');

			this.$el.append(this.bar1);
			this.$el.append(this.bar2);

		},
		render: function(data){
			$('body').append(this.$el);
			return this;
		},
		set : function(loaded, total){

			if(loaded && total && total != 0){
				this.percentage(loaded, total);
			} else {
				this.heartbeat();
			}
			return this;

		},
		percentage : function(_process){
			var _bar1, _bar2;

			_bar1 = _process * 100;

			// loaded = loaded / total * 100;

			// _bar1 = loaded*2 > 100 ? 100 : loaded*2;
			// _bar2 = loaded*2 >= 100 ? 100 - ((loaded-50)*2) : 100;

			// if(_bar1 >= 100){
			// 	this.bar1.remove();
			// 	this.bar2.show();
			// }

			this.bar1.width(_bar1 + '%');
			// this.bar2.width(_bar2 + '%');
		},
		heartbeat : function(){
			// this.$el.toggleClass('blink');
			var self = this;

			this.process = 0.1;

			this.percentage(self.process);

			_heartbeat();

			function _heartbeat(){
				if(self.process < 1){
					self.process += (1- self.process) / 30;
					self.percentage(self.process);
					setTimeout(function(){
						_heartbeat();
					}, 100)
				}
			}

		},
		done : function(){
			var self = this;

			if(this.process){
				this.process = 1;
				this.percentage(self.process);
			}

			setTimeout(function(){
				self.hide();
			}, 500)
		},
		hide : function(page){
			this.undelegateEvents();
			this.$el.removeData().unbind(); 
			this.remove();
			Backbone.View.prototype.remove.call(this);
		},

		link : function(e){
			e.preventDefault();
			backbone.history.navigate(e.target.pathname, { trigger : true });
		}
	});
});
