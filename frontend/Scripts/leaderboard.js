/**
* Count up this particular stat
* @param $(this)		The current (.stat-count) element to count up
* @param sleepTime		How long in milliseconds to sleep for before restarting the call
*/
function countStat($this, sleepTime)
{
	var current = parseInt($this.html(), 10);	
	var total = parseInt($this.data("total"), 10);
	
	if(sleepTime < 1)
	{
		var temp = 0;
		while(temp < 2.0)
		{
			temp += sleepTime;
			++current;
		}
	}
	else
		++current;
	$this.html(current);
	
	if(current >= total)
		$this.html(total);
	else
		setTimeout(function(){ countStat($this, sleepTime)}, sleepTime);
}



// Hide the template from view
$("#lb-entry-template").hide();

/**
* Clear all of the entries in the leaderboard
*/
function ClearLeaderboard()
{
	$(".lb-entry-inst").each(function()
	{
		$(this).remove();
	});
}

/**
* Add a single entry to the leaderboard
* @param {object} entry			The all data about this specific entry
*/
function AddLeaderboardEntry(entry)
{
	var $row = $("#lb-entry-template").clone();
	$row.attr("class", $row.attr("class") + " lb-entry-inst")
	$row.find("#place").text(entry.place);
	$row.find("#name").text(entry.name);
	
	$row.find("#rounds-won").text(entry.roundsWon);
	$row.find("#kills").text(entry.kills);
	$row.find("#deaths").text(entry.deaths);
	$row.find("#bombs-placed").text(entry.bombsPlaced);
	
	$row.find("#matched-played").text(entry.matchesPlayed);
	
	// Display in xyz minutes/days/weeks ago
	var timeSince = Date.now() - Date.parse(entry.lastMatch)
	var asSeconds = Math.floor(timeSince / 1000);
	var asMinutes = Math.floor(asSeconds / 60);
	var asHours = Math.floor(asMinutes / 60);
	var asDays = Math.floor(asHours / 24);
	
	if(asDays != 0)
		$row.find("#last-match").text(asDays + " days ago");
	else if(asHours != 0)
		$row.find("#last-match").text(asHours + " hours ago");
	else if(asMinutes != 0)
		$row.find("#last-match").text(asMinutes + " minutes ago");
	else
		$row.find("#last-match").text(asSeconds + " seconds ago");
	

	$("#lb-table-body").append($row);
	$row.show();
}

/**
* Update the leaderboard with a given query
* @param {function(match object)} 		matchValidator			Callback (True/False) is this match valid for this querry
* @param {function{userId statsObject}} playerValidator			Callback (True/False) is this player data valid for this querry
*/
function ExecuteLeaderboardQuery(matchValidator, playerValidator)
{
	// Fetch the raw player data
	var rawPlayerData = {};	
	
	apiData.matches.forEach(function(match)
	{
		// Only add match if it's valid for the query
		if(matchValidator(match))
		{
		
			// Add players if they are valid for the query
			for(var userId in match.playerStats)
			{
				var stats = match.playerStats[userId];
				if(!matchValidator(userId, stats))
					continue;
				
				// Format the data into leaderboard format
				if(!rawPlayerData.hasOwnProperty(userId))
				{
					// Create new entry
					rawPlayerData[userId] = 
					{
						name: stats.displayName,
						
						roundsWon: stats.roundsWon,
						kills: stats.kills,
						deaths: stats.deaths,
						bombsPlaced: stats.bombsPlaced,
						
						matchesPlayed: 1,
						lastMatch: match.endTime
					}
				}
				else
				{
					// Update existing entry
					rawPlayerData[userId].name = stats.displayName; // Use most recent display name
					
					rawPlayerData[userId].roundsWon += stats.roundsWon;
					rawPlayerData[userId].kills += stats.kills;
					rawPlayerData[userId].deaths += stats.deaths;
					rawPlayerData[userId].bombsPlaced += stats.bombsPlaced
					
					rawPlayerData[userId].matchesPlayed++;
					
					if(rawPlayerData[userId].lastMatch < match.endTime)
						rawPlayerData[userId].lastMatch = match.endTime;
				}
			}
		}
	});
	
	// Sort players by rounds won
	var sortedPlayerData = [];
	
	for(var userId in rawPlayerData)
	{
		var stats = rawPlayerData[userId];
		
		// Find position to data put at
		for(var i = 0; i<sortedPlayerData.length; ++i)
		{
			if(stats.roundsWon > sortedPlayerData[i].roundsWon)
				break;
		}
		
		sortedPlayerData.splice(i, 0, stats);
	}
	
	
	// Add all entries to table
	ClearLeaderboard();
	for(var i = 0; i<sortedPlayerData.length; ++i)
	{
		var stats = sortedPlayerData[i];
		stats.place = i + 1;
		AddLeaderboardEntry(stats);
	}
	
	return rawPlayerData;
}


//
// Add callback so when data is fetched from api, tables will be updated
//
dataReadyCalls.push(function()
{	
	// Update leaderboard using default query
	var rawPlayerData = ExecuteLeaderboardQuery(function(match){ return true}, function(userId, stats){ return true });

	/// Start counter for each stat
	$("#match-played-counter").text(apiData.matches.length);
	$("#active-user-counter").text(Object.keys(rawPlayerData).length);
	
	// Count for all placed bombs
	var bombsPlaced = 0
	for(var userId in rawPlayerData)
		bombsPlaced += rawPlayerData[userId].bombsPlaced;
	$("#bomb-placed-counter").text(bombsPlaced);
	
	$(".stat-count").each(function()
	{
		var total = parseInt($(this).html(), 10);
		
		// Take 1 second to reach target
		$(this).data("total", total);
		$(this).html('0');
		countStat($(this), 1000/total);
	});

});


//
// Setup query input fields
//
$(document).ready(function()
{
	var $fromDateInput = $("#from-date");
	var $toDateInput = $("#to-date");
	var $queryButton = $("#query-btn");
	
	var dateOptions = 
	{
		format: "dd MM yyyy",
		todayHighlight: true,
		autoclose: true
	};
	$fromDateInput.datepicker(dateOptions);
	$toDateInput.datepicker(dateOptions);
	
	// Update leaderboard
	$queryButton.click(function()
	{
		var startDate = Date.parse($fromDateInput.val());
		var endDate = Date.parse($toDateInput.val());
		
		if(startDate == NaN)
			startDate = 0;
		if(endDate == NaN)
			startDate = Date.now();
		
		// Make sure end date is greater than start date
		if(endDate < startDate)
		{
			endDate = Date.now();
			$toDateInput.val("");
		}
		
		// Query for date range
		var rawPlayerData = ExecuteLeaderboardQuery(
		function(match)
		{ 
			return match.startTime >= startDate && match.endTime <= endDate;
		}, 
		function(userId, stats){ return true });
	});
	
});