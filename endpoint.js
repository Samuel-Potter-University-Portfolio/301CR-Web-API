/**
* List of URIs that wish to registered.
* Expected in format:
* 	var object = 
*	{
*		verb: '' 	// Supported verb of this endpoint e.g. get, post, put etc.
*		path: '' 	// Path of URI e.g. /API/Test/thing		
*		exec: ''	// Callback({request}, {response}) for when this endpoint is reached
*	}
*/
exports.URIs = []


/**
* Checks whether the passed object is a valid URI object
* @param {object} uri		The object to checked
* @returns {boolean} Is this object valid
*/
exports.validateURI = function validateURI(uri)
{
	if(typeof uri !== 'object')
		return false;
	
	// Check for required variables and that the variables are the correct type
	if(typeof uri.verb !== 'string')
		return false;
	if(typeof uri.path !== 'string')
		return false;
	if(typeof uri.exec !== 'function')
		return false;
	
	return true;
}


/**
* Forward a http call through to the desired endpoint
* @param {object} req		Http request
* @param {object} resp		Where to respond to
*/
exports.forwardToURI = function(req, resp)
{
	resp.writeHead(404, {'Content-Type' : 'text/plain'});
	resp.end("Yo");
}