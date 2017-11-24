var mongoose = require('mongoose');

var user = require('./user.js');


mongoose.Promise = global.Promise;
var connection = mongoose.connect('mongodb://localhost:27017/BomberBoy',
{
	useMongoClient: true//,	
	//reconnectTries: 30
});

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
		
		
		// Only open Web API if connected to DB
		launchWebAPI();
	}
);


/**
* Open a HTTP server and register the required endpoints
*/
function launchWebAPI()
{
	console.log('Launching API');
	var port = 80;

	var express = require('express'),
		app = express();
		
	// All bodies must be in json format otherwise invalid
	var bodyParser = require('body-parser');
	//app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());

	
	// Start server
	app.listen(port);
	console.log('API running on port ' + port);
	
	
	// Setup frontend folder to server html
	app.use('/', express.static(__dirname + '/frontend'));
	
	// List of all possible endpoints
	var apiPath = '/BomberBoy/API/v1.0'; // How all endpoints past this point will start
	user.registerEndpoints(apiPath, app);
		
		
		
	// Register default 404
	app.use(
		function(req, res)
		{
			res.status(404).send('Path "' + req.originalUrl + '" not found');
		}
	);
}