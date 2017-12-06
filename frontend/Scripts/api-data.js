//  Results of the match results
var apiData = {}


// Array of all callbacks which should be called when data is fetched from the api
var dataReadyCalls = []

// Attempt to fetch data from api
$.ajax(
{
	type: "GET",
	crossDomain: false,
	url: apiURI + "/Match/Results/",
	success: function(data, textStatus, jqXHR)
	{
		console.log("API match results fetched");
		apiData = data;
		dataReadyCalls.forEach(function(fnc)
		{
			fnc();
		});
	},
	error: function(jqXHR, textStatus, error)
	{
		if(typeof jqXHR.responseJSON == 'object')
			$("#statusMsg").text(jqXHR.responseJSON.message);
		else
			$("#statusMsg").text("An error occurred");
	}
}
);