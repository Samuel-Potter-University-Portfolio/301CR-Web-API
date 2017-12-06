exports.secretKey = "5c81377e82d3c32ff464fb3cbcf0ef77";

/**
* Generates a random token through sha256 
* @returns {string} 32 character hex formated token
*/
exports.generateToken = function()
{
	var cry = require('crypto');
	var sha = cry.createHash('sha256');
	sha.update(Math.random().toString());
	return sha.digest('hex').substr(0,32);
}

/**
* Hashes a password 
* @param {string} password						The password to generate the hash for
* @param {function}({error} err, {string}hash) 	callback for when the hash is successful	
*/
exports.hashPassword = function(password, callback)
{                                                                                                                                                                                                                      
	var bcrypt = require('bcrypt'),
		salt = '$2a$13$3mqJi3em5xDdhVgnQ3x6g.';
	
	
	bcrypt.hash(password, salt, 
		function(err, hash)
		{
			callback(err, hash.split('$')[3]);
		}
	);
}