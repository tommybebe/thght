define(function(){
	var cookie = {};
	document.cookie.split(';').forEach(function(v){
		if(v){
			v = v.split('=');
			cookie[v[0].replace(/ /g, '')] = v[1];
		}
	});
	return cookie;
});