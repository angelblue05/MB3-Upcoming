var processing = 0;
var current;
var jsonf = "?format=json";



$(document).ready(function() {
	

	// Verify to load last loaded div by the user
	chrome.storage.local.get('current', function(result) {
		
		if (result['current'] != undefined) {
			current = result['current'];
			window[current]();
		} else {
			// When first time running, setup IP
			ipSetup();
		}
	});	
});


function storageUrl(callback) {

	chrome.storage.local.get(['ip', 'port'], function(result) {
		callback(null, { ipStorage: result['ip'], portStorage: result['port']});
	});
}


function storageUser(callback) {

	chrome.storage.local.get(['userId'], function(result) {
		callback(null, result['userId']);
	});
}


function currentFunc(name) {

	current = name;
	chrome.storage.local.set({ 'current': current });
}


function message(div, string) {
	
	$(div).html(string);
}


function ipSetup() {

	
	// Save the state of the extension
	currentFunc('ipSetup');

	// Reset ipSetup to default
	$('#header_signIn').html('SIGN IN');
	$('#msgconnect').html('');
	$('#setting_ip').val('');
	$('#setting_port').val('8096');

	// Fancy
	$("#server-login").fadeIn('slow');

	// Reset storage for ip setup
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
	        	message('#msgconnect', "Connecting to the server...");

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
	        		message('#msgconnect', "Unable to connect. Please verify your IP or URL and port.");
	        	});
	        	
	        	// End the processing
	        	processing = 0;
		}
	});
}


function getUser() {


	// Save the state of the extension
	currentFunc('getUser');

	// Correctly display when div is last loaded
	$('#server-login').hide();
	// Reset getUser and userSelect/manualLogin divs
	$('#userSelect').html('');
	$('#header_signIn').html('<a id="back_ipSetup">BACK<a>');
	$('#username').val('');
	$('#password').val('');
	$('#msguser').html('');
	$('#panel').hide();

	// Make chrome storage sync
        async.auto({

        	'storageUrl': storageUrl,
        	'getuser list': ['storageUrl', function getUserList(callback, result) {

	      		// Set shortcut to ip and port
	        	var ipStorage = result.storageUrl.ipStorage;
	        	var portStorage = result.storageUrl.portStorage;

			$.getJSON(ipStorage + ":" + portStorage + "/mediabrowser/Users/Public" + jsonf, function(data) {

				// Container for userImage
				var userItems = [];
					
				$.each(data, function(key, val) {
					
					// Display user if enabled and not hidden
					if (val.Configuration.IsDisabled===false && val.Configuration.IsHidden===false) {
						
						var userImage;
						var userPass;

						// Verify is there's a user image
						if (typeof(val.PrimaryImageTag) != 'undefined') {
							userImage = "background-image:url('" + ipStorage + ":" + portStorage + "/mediabrowser/Users/" + val.Id + "/Images/Primary?width=100&tag=" + val.PrimaryImageTag + "')";
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

				callback();
			});
		}]
	});

	// slideToggle
	$('#manualLogin_text').unbind('click');
	$('#manualLogin_text').on('click', function() {

		$('#panel').slideToggle();       
	}); 

	// When pressing the save button
	$('#saveUser').unbind('click');
	$('#saveUser').on('click', function() {

		// Authenticate the user's credentials5
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
}


function todayUp() {
	

	// Save the state of the extension
	currentFunc('todayUp');

	// Correctly display when div is last loaded
	$('#server-login').hide();

	$('#header_signIn').html('<a id="back_getUser">SIGN OUT</a>');

	// Make chrome storage sync
        async.auto({

        	'storageUrl': storageUrl,
        	'ajaxHeader': ajaxHeader,
        	'storageUser': storageUser,
        	'todayUp': ['storageUrl', 'ajaxHeader', 'storageUser', function getUserList(callback, result) {

	      		// Set shortcut to ip and port
	        	var ipStorage = result.storageUrl.ipStorage;
	        	var portStorage = result.storageUrl.portStorage;
	        	var header = result.ajaxHeader;
	        	var userId = result.storageUser;

	        	// Verify if the user's session is still valid
			$.ajaxSetup({
				headers: header,
				statusCode: {
					401: function() {
						logoutUser();
					}
				}
			});

	        	var resp = $.ajax({
				type: "GET",
				url: ipStorage + ":" + portStorage + "/mediabrowser/Shows/Upcoming?UserId=" + userId,
				headers: header,
				dataType: "json",
				contentType: "application/json"
			}).done(function(data){
				// Container for userImage
				console.dir(data);

				var upItems = [];

				$.each(data, function(key, val) {
					console.log(val.Items.Name);
					// Verify is there's a user image
					/*if (typeof(val.PrimaryImageTag) != 'undefined') {
						userImage = "background-image:url('" + ipStorage + ":" + portStorage + "/mediabrowser/Users/" + val.Id + "/Images/Primary?width=100&tag=" + val.PrimaryImageTag + "')";
						// Add images to the upItems array
						upItems.push("<a><div class=\"posterItemImage\" style=\"" + userImage + "\"></div><div class=\"posterItemText\">" + val.Name + "</div></a>");*/

				});
			});

			callback();
		}]
	});

	// When pressing the back button
	$('#back_getUser').unbind('click');
	$('#back_getUser').on('click', function() {

		$('#todayUp').fadeOut(function() {
			
			// Logout user and revoke token
			logoutUser();	
		});
	});
}

function loginUser() {


	// Make chrome storage sync
        async.auto({

        	'storageUrl': storageUrl,
        	'ajaxHeader': ajaxHeader,
        	'loginUser': ['storageUrl', 'ajaxHeader' , function getUserList(callback, result) {
        		
	      		// Set shortcut to ip and port & header
	        	var ipStorage = result.storageUrl.ipStorage;
	        	var portStorage = result.storageUrl.portStorage;
	        	var header = result.ajaxHeader;

			// Process user login information
			var postData = {
				Username: $("#username").val(),
				password: SHA1($("#password").val()),
				passwordMd5: MD5($("#password").val())
			};

			var resp = $.ajax({
				type: "POST",
				url: ipStorage + ":" + portStorage + "/mediabrowser/Users/AuthenticateByName/",
				headers: header,
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

				// Go to Today's upcoming
				$('#userSelect, #manualLogin').fadeOut('slow', function() {
					todayUp();
				});
		  	
			}).fail(function(){
				message('#msguser', "Wrong username or password.");
			});

			callback();
		}]
	});
}


function logoutUser() {
	

	// Make chrome storage sync
        async.auto({

        	'storageUrl': storageUrl,
        	'ajaxHeader': ajaxHeader,
        	'logoutUser': ['storageUrl', 'ajaxHeader', function getUserList(callback, result) {

	      		// Set shortcut to ip and port & header
	        	var ipStorage = result.storageUrl.ipStorage;
	        	var portStorage = result.storageUrl.portStorage;
	        	var header = result.ajaxHeader;

			// Revoke access token
			var resp = $.ajax({
				type: "POST",
				url: ipStorage + ":" + portStorage + "/mediabrowser/Sessions/Logout/",
				headers: header,
				dataType: "json",
				contentType: "application/json"
			}).done(function(){
				// Reset storage for user credentials
				chrome.storage.local.remove('userId');
				chrome.storage.local.remove('user');
				chrome.storage.local.remove('token');
		        })

			callback();
		}]
	});

	// Get the user list, to allow user to re-authenticate
	getUser();
}
