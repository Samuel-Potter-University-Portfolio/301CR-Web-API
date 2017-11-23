///
/// Open a HTTP server and register the required endpoints
///
var port = 80;

var express = require('express');
var app = express();


// List of all possible endpoints
var apiPath = '/BomberBoy/API/v1.0'; // How all endpoints past this point will start

var user = require('./user.js');
app.route(apiPath + '/test')
	.get(user.getUserData);


// Start server
app.listen(port);
console.log('API running on port ' + port);