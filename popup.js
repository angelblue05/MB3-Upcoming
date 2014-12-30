var processing = 0;
var jsonf = "?format=json";

$(document).ready(function() {
  
	// When pressing the connect button
	$('#save_settings').click(function() {
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
		                
		                // Display the list of users
				getUser();
		                
	        	}).fail(function() { /* Testing failed */
	        		$('#msgconnect').html("Unable to connect. Please verify your IP or URL and port.");
	        	});
	        
	        	processing = 0;
		}
	});
});

function getUser() {

	var ipStorage;
	var portStorage;
	
	chrome.storage.local.get(['ip', 'port'], function(result) {
	        ipStorage += result['ip'];
	        portStorage += result['port'];
	});
	
	$.getJSON(ipStorage + ":" + portStorage + "/mediabrowser/Users/Public" + jsonf, function(data) {
		$.each(data, function(key, val) {
							// Display if user is enabled and not hidden
					if (val.Configuration.IsDisabled===false && val.Configuration.IsHidden===false) {
						var userImage;
						var userPass;
						// If user has an image
						if (typeOf )
						$('#userSelect').append(val['Name'] + "<br />\n");
					}
				});
				
		});
			
		$("#server-login").fadeOut('slow');
		$("#userSelect").delay(600).fadeIn('slow');
			
	}).fail(function() { /* Testing failed */
	        $('#msgconnect').html("Unable to connect. Please verify your IP or URL and port.");
	});
	
	/*$.getJSON(chrome.storage.local.get('ip') + ":" + chrome.storage.local.get('port') + "/mediabrowser/Users/AuthenticateByName", function(data) {
		$("#users").html('');
	});*/
}

function headerSetup() {
  
}
