var processing = 0;
var jsonf = "?format=json";
var port = null;

$(document).ready(function() {
	port = chrome.runtime.connect();

	port.onDisconnect.addListener(function() {
		chrome.runtime.sendMessage({cmd: "savestate"});
	});

	chrome.runtime.sendMessage({cmd: "getstate"});

	// When first time running, user need to set up their IP
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

	// When pressing the connect button
	$('#save_settings').on('click', function() {
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
	          
	        	$('#msgconnect').html("Connecting to server..."); /* Message */

	        	// Test with the given IP and port
	        	$.getJSON(ip + ":" + port + "/mediabrowser/Users/Public" + jsonf, function(data) {
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
						getUser();
				})
		                
	        	}).fail(function() { /* Testing failed */
	        		$('#msgconnect').html("Unable to connect. Please verify your IP or URL and port.");
	        	});
	        
	        	processing = 0;
		}
	});
}


function getUser() {

	$.getJSON(ipStorage + ":" + portStorage + "/mediabrowser/Users/Public" + jsonf, function(data) {
		// Container for userImage
		var userItems = [];
		var manualLogin = [];
		$.each(data, function(key, val) {
			// Display if user is enabled and not hidden
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
		
		// Add manual login option
		manualLogin.push("<div class=\"slide\"><a id=\"manualLogin_text\">Manual Login</a><div class=\"panel\"></div></div>");	

		$( "<div/>", {
			"class": "userItems",
			html: userItems.join( "" )
		}).appendTo( "#userSelect");

		$( "<div/>", {
			"class": "userItems",
			html: manualLogin.join( "" )
		}).appendTo( "#manualLogin");

		$('#header_signIn').html('<a id="back_ipSetup">BACK<a>');

		// When pressing the back button
		$('#back_ipSetup').on('click', function() {
			$("#userSelect, #manualLogin").fadeOut(function() {
				// Send back user to set up IP
				ipSetup();	
			});
		});

		// slideToggle
		$('#manualLogin').click(function() {
        $('.panel').slideToggle();        
    	}); 

		$("#server-login").fadeOut('slow');
		$("#userSelect, #manualLogin").delay(600).fadeIn('slow');
	});
}
