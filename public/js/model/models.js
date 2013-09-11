define(function(require){

	var User = {
		_id       : { type : String },
		name      : { type : String },
		character : { type : Array, default : [] }
	},
	Character = {
		_id       : { type : String },
		name      : { type : String }
	}
	Post = {
		_id       : { type : String },
		owner     : { type : String },
		editor    : { type : Array, default : [] },
		content   : { type : PostCotent, default : [] },
	}
	PostCotent = {
		character : { type : String },
		text      : { type : String, default : '' }, 
		date      : { type : String, default : new Date() },
		rows      : { type : Number, default : 3 }
	}

	return {
		User : User,
		Character : Character,
		Post : Post
	};

});