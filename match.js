var Utils = require('./utils.js');

var Mongoose = undefined;
var MatchEntry = undefined;


/**
* Registers any required mongo schema for this script
* @param {object} mongoose			The imported mongoose object
*/
exports.registerSchema = function(mongoose)
{
	// For global access
	Mongoose = mongoose;
	
	var MatchSchema = mongoose.Schema(
		{
			matchId:
			{
				type: String,
				index : {
					unique : true,
					dropDups : true
				},
				required: 'Matches must have a valid unqiue id',
				default: Utils.generateToken
			},
			startTime:
			{
				type: Date,
				required: 'Matches must have a valid start time',
			},
			endTime:
			{
				type: Date,
				required: 'Matches must have a valid end time',
				default: Date.now
			},
			
			playerStats: 
			[{
				player: 
				{ 
					type: mongoose.Schema.Types.ObjectId, 
					ref: 'User'
				},
				kills: Number,
				deaths: Number,
				roundsWon: Number,
				bombsPlaced: Number,
			}]
		}
	);
	
	MatchEntry = mongoose.model('Match', MatchSchema);
	
};

/**
* Registers any required web endpoints for this script
* @param {string} apiPath			What all URIs should begin with
* @param {object} app				The application (express server)
*/
exports.registerEndpoints = function(apiPath, app)
{
	app.route(apiPath + '/Match/Result')
		.post(logMatchData);
};



/**
* Post some new match data
* 	URI: POST <api>/Match/Result
* Requires header 'api-token' with valid secret token
* @param {object} req		Http request object
* @param {object} res		Http response object
*/
function logMatchData(req, res)
{
	// Check for secret token
	if(req.headers["api-token"] !== Utils.secretKey)
	{
		res.status(403).json({ message: 'Not authorized' });
		return;
	}
	
	// Check body
	if(typeof req.body !== 'object')
	{
		res.status(400).json({ message: 'Unable to parse JSON body' });
		return;
	}
	
	// Check required fields
	if(typeof req.body.startTime !== 'number')
	{
		res.status(400).json({ message: 'Missing \'startTime\' number field' });
		return;
	}
	if(typeof req.body.playerStats !== 'object' || req.body.playerStats.constructor !== Array)
	{
		res.status(400).json({ message: 'Missing \'playerStats\' array field' });
		return;
	}
	
	
	// Need to fetch user object ids from player ids
	var userIdLookup = []
	req.body.playerStats.forEach(function(player)
	{
		userIdLookup.push(player.userId);
	});
	
	// Fetch user object ids (to use as foriegn keys)
	Mongoose.model('User').find(
		// Query
		{
			userId:{ $in: userIdLookup }
		},
		'_id_ userId',
		function(err, docs)
		{
			if(err)
			{
				res.status(500).json({ message: 'Error processing the request' });
				return;
			}
			
			// Convert to id lookup
			var idLookup = {};
			docs.forEach(function(doc)
			{
				idLookup[doc.userId] = doc._id;
			});
			
			
			
			// Attempt to create new match data to store
			var newMatch = new MatchEntry();
			newMatch.startTime = new Date(req.body.startTime);
			
			req.body.playerStats.forEach(function(player)
			{
				if(idLookup[player.userId] == undefined)
				{
					res.status(400).json({ message: 'Invalid user id \'' + player.userId + '\' given' });save
					return;
				}
			
				newMatch.playerStats.push({
					player: idLookup[player.userId],
					kills: player.kills,
					deaths: player.deaths,
					roundsWon: player.roundsWon,
					bombsPlaced: player.bombsPlaced,
				});
			});
			
			// Attempt to save new match info
			newMatch.save(
				function(err, doc)
				{
					if(err)
					{
						res.status(500).json({ message: 'Error logging match details', error:err });
						return;
					}
					
					
					res.status(200).json({ message: 'Sucessfully logged match results', matchId:doc.matchId });
					return;
				}
			);
		}
	);
}