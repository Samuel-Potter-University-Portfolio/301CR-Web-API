

/**
* Generates a random token through sha256 
* @returns {string} Hex formated token
*/
function generateToken()
{
	var cry = require('crypto');
	var sha = cry.createHash('sha256');
	sha.update(Math.random().toString());
	// TODO - Database checks
	return sha.digest('hex');	
}


/**
* Retreive user data
* 	URI: GET <api>/User
* @param {object} req		Http request object
* @param {object} res		Http response object
*/
exports.getUserData = 
function(req, res)
{
	res.writeHead(200,
		{
			'Content-Type': 'text/plain'
		}
	);
	
	var obj = 
	{
		'Test': 0,
		'Value': ['hellow', 'world']	
	};
	res.end(JSON.stringify(obj) + "\nNo: " + generateToken());
};