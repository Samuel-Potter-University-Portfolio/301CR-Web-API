

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
	countStat($(this), 3000/total);
});