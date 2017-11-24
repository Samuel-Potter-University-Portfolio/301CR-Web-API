
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

/**
* Hashes a password 
* @param {string} password			The password to generate the hash for
* @param {function}({string}hash) 	callback for when the hash is successful	
*/
exports.hashPassword = function(password, callback)
{
	var bcrypt = require('bcrypt'),
		salt = '$2a$13$3mqJi3em5xDdhVgnQ3x6g.';
	
	
	bcrypt.hash(password, salt, 
		function(err, hash)
		{
			if(err) console.error(err);
			callback(hash.split('$')[3]);
		}
	);
}