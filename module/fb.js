var fb        = require('facebook-js')
	, fbApp   = require('./config/config').fb
	, fbId    = fbApp.id
	, fbPw    = fbApp.pw
	, fbCbUrl = fbApp.cbUrl
	, fbScope = fbApp.scope;

module.exports = {
	getAuthorizeUrl : function(param){
		var param = param || {};
		return fb.getAuthorizeUrl({
			client_id: param.client_id || fbId, 
			redirect_uri: param.redirect_uri || fbCbUrl, 
			scope: param.scope || fbScope
		})
	},
	apiCall : fb.apiCall,
	getAccessToken : function(param, callback){
		var param = param || {};

		if(param.code){
			return fb.getAccessToken(param.key || fbId, param.secret || fbPw, param.code, param.redirect_uri || fbCbUrl, callback);
		} else {
			return false;
		}
	}
}