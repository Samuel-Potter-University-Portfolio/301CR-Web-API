/**
* Generates a random token through sha256 
* @returns {string} Hex formated token
*/
exports.generateToken = function()
{
	var cry = require('crypto');
	var sha = cry.createHash('sha256');
	sha.update(Math.random().toString());
	// TODO - Database checks
	return sha.digest('hex');	
}

