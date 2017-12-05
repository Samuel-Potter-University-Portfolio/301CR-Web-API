

$("#register").click(function()
{
	var badColour = "#FFCDD2";
	var goodColour = "#C8E6C9";
	
	var allValid 		= true;
	var email 			= $("#email").val();
	var name 			= $("#name").val();
	var pass 			= $("#pwd").val();
	var passConfirm 	= $("#pwdConfirm").val();
	
	
	// Check email format email
	var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	if(!regex.test(email))
	{
		$("#email").css("background-color", badColour);
		allValid = false;
	}
	else
		$("#email").css("background-color", goodColour);
	
	
	// Check name
	if(name.length < 3)
	{
		$("#name").css("background-color", badColour);
		allValid = false;
	}
	else
		$("#name").css("background-color", goodColour);
	
	
	// Check password
	if(pass.length < 4)
	{
		$("#pwd").css("background-color", badColour);
		$("#pwdConfirm").css("background-color", badColour);
		allValid = false;
	}
	else
	{
		$("#pwd").css("background-color", goodColour);
	
		// Check password matches
		if(pass != passConfirm)
		{
			$("#pwdConfirm").css("background-color", badColour);
			allValid = false;
		}
		else
			$("#pwdConfirm").css("background-color", goodColour);
	}
	
	
	// Attempt to send request
	if(allValid)
	{
		// Disable while request outgoing
		$("#register").attr("disabled", true);	
		
		
		// Send request to register user
		$.ajax(
		{
			type: "POST",
			crossDomain: true,
			url: apiURI + "/User/Register",
			contentType: "application/json",
			data: JSON.stringify(
				{
					email: email,
					password: pass,
					displayName: name
				}
			),
			success: function(data, textStatus, jqXHR)
			{
				$("#register").css("background-color", goodColour);
				$("#statusMsg").css("color", goodColour);
				$("#statusMsg").text("Success!");
			},
			error: function(jqXHR, textStatus, error)
			{
				console.error("Error on request (" + textStatus + "): '" + error + "'");
				$("#register").attr("disabled", false);	
				
				$("#statusMsg").css("color", badColour);
				if(typeof jqXHR.responseJSON == 'object')
					$("#statusMsg").text(jqXHR.responseJSON.message);
				else
					$("#statusMsg").text("An error occurred");
			}
		}
		);
	}
});