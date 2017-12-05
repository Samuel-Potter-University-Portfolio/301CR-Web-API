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


/// Start counter for each stat
$(".stat-count").each(function()
{
	var total = parseInt($(this).html(), 10);
	
	// Take 1 second to reach target
	$(this).data("total", total);
	$(this).html('0');
	countStat($(this), 2000/total);
});



// Hide the template from view
$("#lb-entry-template").hide();

/**
* Clear all of the entries in the leaderboard
*/
function ClearLeaderboard()
{
	var template = $("#lb-entry-template");
	$(".lb-entry").each(function()
	{
		// Don't delete template
		if($(this) != template)
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
	$row.find("#place").text(entry.place);
	$row.find("#name").text(entry.name);
	$row.find("#score").text(entry.score);
	$row.find("#matched-played").text(entry.matchesPlayed);
	$row.find("#last-match").text(entry.lastMatch);

	$("#lb-table-body").append($row);
	$row.show();
}
/**
* Add multiple leaderboard entries
* @param {object:array} entries			An array of all the entries to add
*/
function AddLeaderboardEntries(entries)
{
	entries.forEach(function(entry)
	{
		AddLeaderboardEntry(entry);
	});
}

AddLeaderboardEntries(
[
	{
		place: 1,
		name: "Test Guy",
		score: 100,
		matchesPlayed: 15,
		lastMatch: "1 day ago"	
	},
	{
		place: 1,
		name: "Test Guy",
		score: 100,
		matchesPlayed: 15,
		lastMatch: "1 day ago"	
	}
]
);