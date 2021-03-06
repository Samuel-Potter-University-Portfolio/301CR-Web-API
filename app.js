var mongoose = require('mongoose');

var user = require('./user.js');
var match = require('./match.js');

///
/// Setup logging to a file
///
var fs = require('fs');
var logFile = fs.createWriteStream(__dirname + '/node.log', { flags: 'w'});

var GetTimeStamp = function()
{	
	var d = new Date();
	return d.getFullYear() + '/' + d.getMonth() + '/' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
}
var stdout = process.stdout;
var stderr = process.stderr;
console.log = function(msg)
{
	var stamp = '[' + GetTimeStamp() + ']: ';
	logFile.write(stamp + msg + '\n');
	stdout.write(stamp + msg + '\n');
};
console.error = function(msg)
{
	var stamp = '[' + GetTimeStamp() + '][ERROR]: ';
	logFile.write(stamp + msg + '\n');
	stderr.write(stamp + msg + '\n');
};


///
/// Setup DB
///
mongoose.Promise = global.Promise;
var dbAddr = (process.env.DB || 'mongodb://localhost:27017/BomberBoy');
var connection = mongoose.connect(dbAddr,
{
	useMongoClient: true,	
	socketTimeoutMS: 20000,
	reconnectTries: 30
});

console.log('Attempting to connect to db at \'' + dbAddr + '\'');
connection.then(
	function(db)
	{
		db.on('error', console.error.bind(console, 'connection error:'));
		db.once('open', 
			function()
			{
				// TODO - check (Doesn't call..?)
				console.log("Mongo OPEN");
			}
		);
		
		console.log("Connected to MongoDB");
				
		// Register all required schema
		console.log("--Registering schema");
		user.registerSchema(mongoose);
		match.registerSchema(mongoose);
		
		
		//
		// Only open Web API if connected to DB
		//
		launchWebAPI();
	}
);


/**
* Open a HTTP server and register the required endpoints
*/
function launchWebAPI()
{
	console.log('Launching API');
	var port = process.env.PORT || 80;

	var express = require('express'),
		app = express();
		
	// All bodies must be in json format otherwise invalid
	var bodyParser = require('body-parser');
	//app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());

	
	// Start server
	app.listen(port);
	console.log('API running on port ' + port);
	
	
	// Setup frontend folder to serve html
	app.use('/', express.static(__dirname + '/frontend'));
	
	// List of all possible endpoints
	var apiPath = '/BomberBoy/API/v1.0'; // How all endpoints past this point will start
	user.registerEndpoints(apiPath, app);
	match.registerEndpoints(apiPath, app);
		
		
		
	// Register default 404
	app.use(
		function(req, res)
		{
			res.status(404).send('Path "' + req.originalUrl + '" not found');
		}
	);
}