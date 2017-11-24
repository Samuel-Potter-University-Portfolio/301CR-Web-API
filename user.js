var Utils = require('./utils.js');

var UserEntry = undefined;


/**
* Registers any required mongo schema for this script
* @param {object} mongoose			The imported mongoose object
*/
exports.registerSchema = function(mongoose)
{
	var UserSchema = mongoose.Schema(
		{
			userId:
			{
				type: String,
				index : {
					unique : true,
					dropDups : true
				},
				required: 'Account must have a valid unqiue user id'
			},
			email:
			{
				type: String,
				index : {
					unique : true,
					dropDups : true
				},
				required: 'Account must have a valid unqiue email to register under',
				validate :
				[
					function(email)
					{
						// https://stackoverflow.com/questions/18022365/mongoose-validate-email-syntax
						var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
						return regex.test(email)
					},
					'Invalid email given'
				]
			},
			password:
			{
				type: String,
				required: 'Account must have a password assigned'				
			},
			displayName:
			{
				type: String,
				required: true
			},
			creationDate:
			{
				type: Date,
				default: Date.now
			}
		}
	);
	
	UserEntry = mongoose.model('User', UserSchema);
};

/**
* Registers any required web endpoints for this script
* @param {string} apiPath			What all URIs should begin with
* @param {object} app				The application (express server)
*/
exports.registerEndpoints = function(apiPath, app)
{
	app.route(apiPath + '/User/:userId') // Defaults whatever comes after to be user id
		.get(getUserData);
		
	app.route(apiPath + '/User/Register')
		.post(registerNewUser);
};



/**
* Register a new user
* 	URI: POST <api>/User/Register
* @param {object} req		Http request object
* @param {object} res		Http response object
*/
function registerNewUser(req, res)
{	
	// Check body
	if(typeof req.body !== 'object')
	{
		res.status(400).json({ message: 'Unable to parse JSON body' });
		return;
	}
	
	// Check required fields
	if(typeof req.body.email !== 'string')
	{
		res.status(400).json({ message: 'Missing \'email\' string field' });
		return;
	}
	if(typeof req.body.password !== 'string')
	{
		res.status(400).json({ message: 'Missing \'password\' string field' });
		return;
	}
	if(typeof req.body.displayName !== 'string')
	{
		res.status(400).json({ message: 'Missing \'displayName\' string field' });
		return;
	}
	
	
	Utils.hashPassword(req.body.password, 
		function(hash)
		{
					
			// Attempt to register new user
			var newUser = new UserEntry(
				{
					userId: Utils.generateToken(),
					email: req.body.email,
					password: hash,
					displayName: req.body.displayName,
				}
			);
			newUser.save(
				function(err, usr)
				{
					if(err)
					{
						// Duplicate key
						if(err.name == 'MongoError' && err.code == 11000)
						{
							// Work out which key is duplicated
							var field = err.message.split('index: ')[1].split(' dup key:')[0];
							
							// Email already registered
							if(field == 'email_1')
							{
								res.status(409).json(
									{
										message: 'Account already registered using this email',
									}
								)
							}
							// Account Id already used
							else if(field == 'userId_1')
							{
								res.status(500).json(
									{
										message: 'Error generating account ID',
									}
								)
								// TODO - Generate new account id and just recall
							}
							else
							{
								res.status(400).json(
									{
										message: 'Uh Oh',
									}
								);
								console.error(err);
							}
						}
						
						// Some other internal error
						else 
						{
							res.status(500).json(
								{
									message: 'Request internally failed',
								}
							);
							console.error(err);
						}
						
						return;
					}
					else
					{
						// Respond with user registered and userId
						res.status(200).json(
							{
								message: 'User succesfully registered',
								userId: usr.userId
							}
						);
					}
				}
			);
		}
	);
};


/**
* Retreive globally avaliable user data by userId
* 	URI: GET <api>/User/<userId>
* @param {object} req		Http request object
* @param {object} res		Http response object
*/
function getUserData(req, res)
{
	// Check id
	var userId = req.params.userId;
	if(typeof userId !== 'string')
	{
		res.status(400).json({ message: 'Expected id to be given' });
		return;
	}
	// Check id is correct format
	if(/[^abcdef^0-9]/.test(userId))
	{
		res.status(400).json({ message: 'Expected id to be given in lowercase hex format' });
		return;
	}
		
	
	UserEntry.findOne({ 'userId': userId }, 'displayName creationDate',
		function(err, usr)
		{
			if(err)
				res.status(500).json({ message: 'Unable to query for user' });
			else if(usr == null)
				res.status(400).json({ message: 'Unable to find user of given id' });
			else
				res.status(200).json({ displayName: usr.displayName, creationDate: usr.creationDate });
		}
	);
};