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

	// Reset getUser and userSelect/manualLogin divs
	$('#header_signIn').html('<a id="back_ipSetup" class="headerButton">BACK<a>');
	$('#userSelect').html('');
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
						var userPass = "login_woPass";

						// Verify is there's a user image
						if (typeof(val.PrimaryImageTag) != 'undefined') {
							userImage = "background-image:url('" + ipStorage + ":" + portStorage + "/mediabrowser/Users/" + val.Id + "/Images/Primary?width=100&tag=" + val.PrimaryImageTag + "')";
						} else {
							// Default image for undefined
							userImage = "background-image:url(/css/images/userflyoutdefault.png)";
						}

						if (val.HasPassword === true) {
							userPass = "login_wPass";
						}

						// Add default images to the userItems array
						userItems.push("<a id=\"" + val.Id + "\" class=\"" + userPass + "\" data-user=\"" + val.Name + "\" href=\"#\"><div class=\"posterItemImage\" style=\"" + userImage + "\"></div><div class=\"posterItemText\">" + val.Name + "</div></a>");
						
					}
				});

				// Create a div userItems that contains users
				$( "<div/>", {
					"class": "userItems",
					html: userItems.join( "" )
				}).appendTo( "#userSelect");

				// If userPass = "login_woPass"
				$('.login_woPass').unbind('click');
				$('.login_woPass').on('click', function() {

					var id = $(this).attr("id");
					var dataUser = $(this).attr("data-user");

					// Authenticate the user's credentials
					loginUser(id, dataUser);
				});

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
}


function todayUp() {
	

	// Save the state of the extension
	currentFunc('todayUp');

	$('#header_signIn').html('<a id="back_getUser" class="headerButton">SIGN OUT</a>');

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
				url: ipStorage + ":" + portStorage + "/mediabrowser/Shows/Upcoming?UserId=" + userId + "&Limit=30",
				headers: header,
				dataType: "json",
				contentType: "application/json"
			}).done(function(data){

				var date = yyyymmdd();
				// Container for upcoming items
				var upItems = [];

				$.each(data.Items, function(key, val) {
						
					// Shortened PremiereDate to only include the date
					var shortDate = (val.PremiereDate).substring(0, 10);
					
					if (shortDate == date) {

						// To display: Image, Series Name, S00E00,
						// Episode name, Air time, Network if possible
						console.log('the episode name is ' + val.Name + 'and the date airing is ' + shortDate + '. The Series name is ' + val.SeriesName + '. The season is ' + val.ParentIndexNumber + ' and episode is ' + val.IndexNumber);
						
						
						var resp = $.ajax({
							type: "GET",
							url: ipStorage + ":" + portStorage + "/mediabrowser/Studios?UserId=" + userId + "&NameStartsWithOrGreater=" + val.SeriesName,
							headers: header,
							dataType: "json",
							contentType: "application/json"
						}).done(function(data) {

							console.log(data);
						})

						// Verify if the file is currently available to view via MB3
						/*if (val.LocationType === "FileSystem") {
							console.log('available!');

							// Attach a link to MB3 - when the file is available
							console.log('path to the episode ' + ipStorage + ":" + portStorage + "/mediabrowser/dashboard/itemdetails.html?id=" + val.Id);
						}*/
					}

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

function loginUser(id, dataUser) {


	// Make chrome storage sync
        async.auto({

        	'storageUrl': storageUrl,
        	'ajaxHeader': ajaxHeader,
        	'loginUser': ['storageUrl', 'ajaxHeader' , function getUserList(callback, result) {
        		
	      		// Set shortcut to ip and port & header
	        	var ipStorage = result.storageUrl.ipStorage;
	        	var portStorage = result.storageUrl.portStorage;
	        	var header = result.ajaxHeader;

	        	if (id != undefined) {
	        		// Process user login information userItems
	        		var postData = {
	        			Username: dataUser,
	        			password: SHA1(''),
	        			passwordMd5: MD5('')
	        		};
	        	} else {
	        		// Process user login information
				var postData = {
					Username: $("#username").val(),
					password: SHA1($("#password").val()),
					passwordMd5: MD5($("#password").val())
				};
			}

			var resp = $.ajax({
				type: "POST",
				url: ipStorage + ":" + portStorage + "/mediabrowser/Users/AuthenticateByName/",
				headers: header,
				data: JSON.stringify(postData),
				dataType: "json",
				contentType: "application/json"
			}).done(function(data){
				
				// User appropriate source, manual login vs userList
				if (dataUser != undefined) {
					chrome.storage.local.set({ 'userId': id });
				} else {
					chrome.storage.local.set({ 'userId': data.User.Id });
				}

				// User sucessfully authenticated
		                chrome.storage.local.set({
		                	'user': JSON.stringify(data.User),
		                	'token': data.AccessToken
		                })

				// Go to Today's upcoming
				$('#userSelect, #manualLogin').fadeOut('slow');

				// Go to Today's upcoming. The function used to be inside
				// the fadeOut, but it duplicated the ajax request
				todayUp();
		  	
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
