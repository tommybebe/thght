;( function( $ ) {

	$.fn.alert = function(){
		var self = this;
		self.addClass('alert')
		setTimeout(function(){
			self.removeClass('alert')
		}, 500);
		return this;
	}

} )( jQuery );