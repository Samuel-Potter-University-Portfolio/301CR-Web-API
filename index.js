var endpoints = require('./endpoint.js');


var ip = "127.0.0.1"
var port = 80;
var http = require('http');

http.createServer(endpoints.forwardToURI).listen(port, ip);
console.log('API running on ' + ip + ':' + port);