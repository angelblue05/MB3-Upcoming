var processing = 0;
var jsonf = "?format=json";
var port = null;

$(document).ready(function() {
	port = chrome.runtime.connect();

	port.onDisconnect.addListener(function() {
		chrome.runtime.sendMessage({cmd: "savestate"});
	});

	chrome.runtime.sendMessage({cmd: "getstate"});

	// When first time running, setup IP
	ipSetup();
	
});

function ipSetup() {

	
	// Reset ipSetup to default
	$('#header_signIn').html('SIGN IN');
	$('#msgconnect').html('');
	$('#setting_ip').val('');
	$('#setting_port').val('8096');

	// Fancy
	$("#server-login").fadeIn('slow');

	// Reset storage for good mesure
	chrome.storage.local.remove('ip');
	chrome.storage.local.remove('port');

	// When pressing the connect button
	$('#connect').unbind('click');
	$('#connect').on('click', function() {
		
		if (processing == 0) {  
	        	
	        	// Prevent user from pressing connect multiple times.
	        	processing = 1;

	        	// Save user IP and port
	        	var ip = $('#setting_ip').val();
	        	var port = $('#setting_port').val();
          
	        	// Verify if the IP contains http/https
	        	if (ip.toLowerCase().indexOf('http://') == -1 && ip.toLowerCase().indexOf('https://') == -1) {
	                	ip = 'http://' + ip;
	        	}
	          	
	          	// Message
	        	$('#msgconnect').html("Connecting to server...");

	        	// Test with the given IP and port
	        	$.getJSON(ip + ":" + port + "/mediabrowser/Users/Public" + jsonf, function() {
		                
		                // Testing successful, save IP and port to storage
		                chrome.storage.local.set({
		                	'ip': ip,
		                	'port': port
		                })
		                
		                // Set variable using storage
		                chrome.storage.local.get(['ip', 'port'], function(result) {
					ipStorage = result['ip'];
					portStorage = result['port'];
						
		                	// Display the list of users
					$("#server-login").fadeOut(function() {
						getUser();	
					});
				})
			
			// Testing failed      
	        	}).fail(function() {
	        		$('#msgconnect').html("Unable to connect. Please verify your IP or URL and port.");
	        	});
	        	
	        	// End the processing
	        	processing = 0;
		}
	});
}


function getUser() {


	$.getJSON(ipStorage + ":" + portStorage + "/mediabrowser/Users/Public" + jsonf, function(data) {
		
		// Reset getUser and userSelect/manualLogin divs
		$('#userSelect').html('');
		$('#header_signIn').html('<a id="back_ipSetup">BACK<a>');

		// Container for userImage
		var userItems = [];
			
		$.each(data, function(key, val) {
			
			// Display user if enabled and not hidden
			if (val.Configuration.IsDisabled===false && val.Configuration.IsHidden===false) {
				
				var userImage;
				var userPass;
				
				// Verify is there's a user image
				if (typeof(val.PrimaryImageTag) != 'undefined') {
					userImage = "background-image:url('"+ ipStorage +":"+ portStorage +"/mediabrowser/Users/"+val.Id+"/Images/Primary?width=100&tag="+val.PrimaryImageTag+"')";
					// Add images to the userItems array
					userItems.push("<a><div class=\"posterItemImage\" style=\"" + userImage + "\"></div><div class=\"posterItemText\">" + val.Name + "</div></a>");
				} else {
					// Default image for undefined
					userImage = "background-image:url(/css/images/userflyoutdefault.png)";
					// Add default images to the userItems array
					userItems.push("<a><div class=\"posterItemImage\" style=\"" + userImage + "\"></div><div class=\"posterItemText\">" + val.Name + "</div></a>");
				}
			}
		});

		// Create a div userItems that contains users
		$( "<div/>", {
			"class": "userItems",
			html: userItems.join( "" )
		}).appendTo( "#userSelect");

		// slideToggle
		$('#manualLogin_text').unbind('click');
		$('#manualLogin_text').on('click', function() {

			$('.panel').slideToggle();       
		}); 

		// When pressing the save button
		$('#saveUser').unbind('click');
		$('#saveUser').on('click', function() {

			// Authenticate the user's credentials
			loginUser();

		});

		// When pressing the back button
		$('#back_ipSetup').unbind('click');
		$('#back_ipSetup').on('click', function() {

			$("#userSelect, #manualLogin").fadeOut(function() {
				
				// Send user back to setup IP
				ipSetup();	
			});
		});

		// Fancy
		$("#userSelect, #manualLogin").fadeIn('slow');
	});
}

function loginUser() {


	// Process user login information
	var postData = {
		Username: $("#username").val(),
		password: SHA1($("#password").val()),
		passwordMd5: MD5($("#password").val())
	};

	var resp = $.ajax({
		type: "POST",
		url: ipStorage + ":" + portStorage + "/mediabrowser/Users/AuthenticateByName/",
		headers: ajaxHeader(),
		data: JSON.stringify(postData),
		dataType: "json",
		contentType: "application/json"
	}).done(function(data){
		// User sucessfully authenticated
                chrome.storage.local.set({
                	'userId': data.User.Id,
                	'user': JSON.stringify(data.User),
                	'token': data.AccessToken
                })
  	
	});

}