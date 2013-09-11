define(function(require){

	var $        = require('jquery'),
		_        = require('lodash'),
		backbone = require('backbone'),
		config   = require('config/index');

	var Loading  = require('./view/loading');

	var methodMap = {
		'create' : 'POST',
		'update' : 'PUT',
		'delete' : 'DELETE',
		'read'   : 'GET'
	};

	return function(method, model, options){

		var type = methodMap[method];

		// Default options, unless specified.
		_.defaults(options || (options = {}), {
		  emulateHTTP: Backbone.emulateHTTP,
		  emulateJSON: Backbone.emulateJSON
		});

		// Default JSON-request options.
		var params = {type: type, dataType: 'json'};

		// Ensure that we have a URL.
		if (!options.url) {
		  params.url = _.result(model, 'url') || urlError();
		}

		// Ensure that we have the appropriate request data.
		if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
		  params.contentType = 'application/json';
		  params.data = JSON.stringify(options.attrs || model.toJSON(options));
		}

		// For older servers, emulate JSON by encoding the request into an HTML-form.
		if (options.emulateJSON) {
		  params.contentType = 'application/x-www-form-urlencoded';
		  params.data = params.data ? {model: params.data} : {};
		}

		// For older servers, emulate HTTP by mimicking the HTTP method with `_method`
		// And an `X-HTTP-Method-Override` header.
		if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
		  params.type = 'POST';
		  if (options.emulateJSON) params.data._method = type;
		  var beforeSend = options.beforeSend;
		  options.beforeSend = function(xhr) {
		    xhr.setRequestHeader('X-HTTP-Method-Override', type);
		    if (beforeSend) return beforeSend.apply(this, arguments);
		  };
		}

		// Don't process data on a non-GET request.
		if (params.type !== 'GET' && !options.emulateJSON) {
		  params.processData = false;
		}

		// If we're sending a `PATCH` request, and we're in an old Internet Explorer
		// that still has ActiveX enabled by default, override jQuery to use that
		// for XHR instead. Remove this line when jQuery supports `PATCH` on IE8.
		if (params.type === 'PATCH' && window.ActiveXObject &&
		      !(window.external && window.external.msActiveXFilteringEnabled)) {
		  params.xhr = function() {
		    return new ActiveXObject("Microsoft.XMLHTTP");
		  };
		}

		// -------------------------------------------------------------------------------------
		var opts = _.extend(params, options);
		
		if(model.methodMap){
			opts.type = model.methodMap[method];
		}
		if(model.db){
			opts.url += model.db;
		}
		if(model.view){
			var filter;

			opts.url += model.view.defaultUri;

			if(opts.filter && opts.filter.view){
				filter = opts.filter.view;
			}

			if(model.view.viewName){
				opts.url += model.view.viewName[filter || 'default'];
			}
		}
		if(model.key){
			if(_.isArray(model.key)){
				opts.data = { keys : model.key };
			} else if(_.isString(model.key)) {
				opts.url += '?key=' + JSON.stringify(model.key);
			}
			opts.url += '&descending=true';
		} else {
			opts.url += '?descending=true';
		}

		if(opts.skip) opts.url += '&skip=' + opts.skip;
		if(opts.limit) opts.url += '&limit=' + opts.limit;

		opts.url = opts.url.replace('//', '/').replace('??', '?');

		var loading = new Loading();

		loading.render();

		opts.xhr = function() {
			var xhr = $.ajaxSettings.xhr();
			xhr.addEventListener('progress', function(e){
				loading.set(e.loaded / e.total);
			});
			xhr.addEventListener('load', function(e) {
				loading.done();
			});

			return xhr;
		}

		// Make the request, allowing the user to override any Ajax options.
		var xhr = options.xhr = Backbone.ajax(opts);
		model.trigger('request', model, xhr, options);
		return xhr;
	}
});