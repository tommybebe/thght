var _   = require('lodash'),
	key = require('./key');

var config = {
	domain           : 'localhost',
	// apiUrl           : 'https://minwoo.iriscouch.com:6984',
	// apiUrl           : 'http://192.168.68.128:5984', // local virtual machine
	apiUrl           : 'http://54.250.146.122:5984', // ec2 tommybebe@naver.com
	expireTime       : new Date(Date.now() + 360 * 1000),  // 0.001 second
	maxAge           : 360 * 1000,
	proxyPort        : 9000,
	storagePort      : 8008,
	serverPort       : 8000,
	cookieSecret     : "hash",
	env              : 'development'
	// env : 'production',
}

if(config.env == 'development') config.domain = 'localhost';

module.exports = _.extend(config, key);