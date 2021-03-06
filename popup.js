var processing = 0;
var current;
var upContentDay = 0;
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

	/*document.addEventListener('contextmenu', function(e) {
		if (e.srcElement.className == "bannerItemImage") {
			console.log(e.target.getAttribute('id'));
		}
		//e.preventDefault();
	}, false);*/
});


function storageUrl(callback) {

	chrome.storage.local.get(['ip', 'port'], function(result) {
		callback(null, { ipStorage: result['ip'], portStorage: result['port'] });
	});
}


function storageUser(callback) {

	chrome.storage.local.get(['userId'], function(result) {
		callback(null, result['userId']);
	});
}

function storageCheckIcon(callback) {

	chrome.storage.local.get('checkIcon', function(result) {

		if (result['checkIcon'] != undefined) {
			
			// If value is stored, load it
			callback(null, { checkIcon: result['checkIcon'] });
		} else {
			// If the value is undefined, set to false by default
			callback(null, { checkIcon: "corner" })
		}
	});
}

function storageWatched(callback) {

	chrome.storage.local.get('hideWatched', function(result) {
		
		if (result['hideWatched'] != undefined) {
			
			// If value is stored, load it
			callback(null, { hideWatched: result['hideWatched'] });
		} else {
			// If the value is undefined, set to false by default
			callback(null, { hideWatched: false })
		}
	});
}

function storageDisliked(callback) {

	chrome.storage.local.get('hideDisliked', function(result) {

		if (result['hideDisliked'] != undefined) {
			// If value is stored, load it
			callback(null, { hideDisliked: result['hideDisliked'] });
		} else {
			// If the value is undefined, set to false by default
			callback(null, { hideDisliked: false})
		}
	});
}


function currentFunc(name, up) {

	chrome.storage.local.set({ 'current': name });
}


function message(div, string) {
	
	$(div).html(string);
}


function ipSetupReset() {

	// This function is to reset ipSetup
	// to it's original state.
	$('#header_signIn').html('SIGN IN');
	$('#msgconnect').html('');
	$('#setting_ip').val('');
	$('#setting_port').val('8096');

	// Reset storage ip and port
	chrome.storage.local.remove('ip');
	chrome.storage.local.remove('port');
}

// ipSetup is completed
function ipSetup() {


	// Save the state of the extension
	currentFunc('ipSetup');

	// Reset ipSetup to default
	ipSetupReset();

	// Fancy
	$("#server-login").fadeIn('slow');

	$('#setting_ip, #setting_port').keypress(function(e){
						  
		if(e.keyCode==13) {
			$('#connect').click();
		}
	});
	// When pressing the connect button
	$('#connect').off('click');
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
				$.getJSON(ip + ":" + port + "/emby/Users/Public" + jsonf, function() {
						
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


function getUserReset() {

	// This function is to reset getUser
	// to it's original state.
	$('#header_signIn').html('<a id="back_ipSetup" class="headerButton">BACK<a>');
	$('#logo').show();
	// Reset inputs
	$('#username').val('');
	$('#password').val('');
	$('#password2').val('');
	// Reset manual login
	$('.slide').show();
	$('#panel').hide();
	$('#passSlide').hide();
	$('#msguser').html('');
	$('#msguser2').html('');
	// Reset list of users
	$('#userSelect').html('');
	// Reset upcoming
	$('#upcomingList').hide();
	$('#settings').hide();
	$('#preferences').hide();
	$('#dateSelector').hide();
	$('#shortenedLogo').hide();
}

// getUser is completed
function getUser() {


	// Save the state of the extension
	currentFunc('getUser');

	// Reset getUser to default
	getUserReset();

	// Make chrome storage sync
		async.auto({

			'storageUrl': storageUrl,
			'getuser list': ['storageUrl', function getUserList(callback, result) {

				// Set shortcut to ip and port
				var ipStorage = result.storageUrl.ipStorage;
				var portStorage = result.storageUrl.portStorage;

			$.getJSON(ipStorage + ":" + portStorage + "/emby/Users/Public" + jsonf, function(data) {

				// Container for userImage
				var userItems = [];
					
				$.each(data, function(key, val) {
					
					// Public list
				
					var userImage;
					var userPass = "login_woPass";

					// Verify is there's a user image
					if (typeof(val.PrimaryImageTag) != 'undefined') {
						
						userImage = "background-image:url('" + ipStorage + ":" + portStorage + "/emby/Users/" + val.Id + "/Images/Primary?width=100&tag=" + val.PrimaryImageTag + "')";
					
					} else {
						// Default image for undefined
						userImage = "background-image:url(/css/images/userflyoutdefault.png)";
					}

					// Verify is the user has a password
					if (val.HasPassword === true) {
						userPass = "login_wPass";
					}

					// Add default images to the userItems array
					userItems.push("<a id=\"" + val.Id + "\" class=\"" + userPass + "\" data-user=\"" + val.Name + "\"><div class=\"posterItemImage\" style=\"" + userImage + "\"></div><div class=\"posterItemText\">" + val.Name + "</div></a>");
				});

				// Create a div userItems that contains users
				$( "<div/>", {
					"class": "userItems",
					html: userItems.join("")
				}).appendTo("#userSelect");


				// If userPass = "login_woPass"
				$('.login_woPass').off('click');
				$('.login_woPass').on('click', function() {

					var id = $(this).attr("id");
					var dataUser = $(this).attr("data-user");

					// Authenticate the user's credentials
					loginUser(id, dataUser, false);
				});

				// If userPass = "login_wPass"
				$('.login_wPass').off('click');
				$('.login_wPass').on('click', function() {

					var id = $(this).attr("id");
					var dataUser = $(this).attr("data-user");

					// Display password field
					$('.slide').hide('fast', function() {
						
						$('#passSlide').slideDown('fast');
						$('#password2').keypress(function(e){
						  
							if(e.keyCode==13) {
								$('#saveInput').click();
							}
						});
					});

					// Authenticate login_wPass
					$('#saveInput').off('click');
					$('#saveInput').on('click', function() {

						// Authenticate the user
						loginUser(id, dataUser, true);
					});
				});

				// Cancel Password field input when using UserItems
				$('#cancelInput').off('click');
				$('#cancelInput').on('click', function() {

					// If manual login panel is open, hide it
					$('#panel').hide();

					$('#passSlide').hide('fast', function() {
						$('.slide').slideDown('fast');
					});

					// Cancel resets any password username input
					$('#username').val('');
					$('#password').val('');
					$('#password2').val('');
					$('#msguser').html('');
					$('#msguser2').html('');
				});

				callback();
			});
		}]
	});

	// slideToggle
	$('#manualLogin_text').off('click');
	$('#manualLogin_text').on('click', function() {

		$('#panel').slideToggle();
		$('#password, #username').keypress(function(e){

			if(e.keyCode==13) {
				$('#saveUser').click();
			}
		});    
	});

	// When pressing the save button
	$('#saveUser').off('click');
	$('#saveUser').on('click', function() {

		// Authenticate the user's credentials
		loginUser();
	});

	// When pressing the back button
	$('#back_ipSetup').off('click');
	$('#back_ipSetup').on('click', function() {

		$('#user-login').fadeOut(function() {
			
			// Send user back to setup IP
			ipSetup();	
		});
	});


	// Fancy
	$('#user-login').fadeIn('slow');
}

/*function contextmenu(series, favorite, disliked) {
	console.log(series + favorite + disliked)
}*/
// loginUser is completed
function loginUser(id, dataUser, hasPassword) {

	// Make chrome storage sync
		async.auto({

			'storageUrl': storageUrl,
			'ajaxHeader': ajaxHeader,
			'loginUser': ['storageUrl', 'ajaxHeader' , function getUserList(callback, result) {
				
				// Set shortcut to ip, port and header
				var ipStorage = result.storageUrl.ipStorage;
				var portStorage = result.storageUrl.portStorage;
				var header = result.ajaxHeader;

				if (id != undefined && hasPassword === false) {
					// Process user login with no password
					var postData = {
						Username: dataUser,
						password: SHA1(''),
						passwordMd5: MD5('')
					};
				
				} else if (id != undefined && hasPassword === true) {
					// Process user login with password
					var postData = {
						Username: dataUser,
						password: SHA1($("#password2").val()),
						passwordMd5: MD5($("#password2").val())
					};
				
				} else {
					// Process user manual login
				var postData = {
					Username: $("#username").val(),
					password: SHA1($("#password").val()),
					passwordMd5: MD5($("#password").val())
				};
			}

			var resp = $.ajax({
				type: "POST",
				url: ipStorage + ":" + portStorage + "/emby/Users/AuthenticateByName/",
				headers: header,
				data: JSON.stringify(postData),
				dataType: "json",
				contentType: "application/json"
			
			}).done(function(data){
				
				// User appropriate source, manual login vs userList
				if (dataUser != undefined) {
					// If userItem is used
					chrome.storage.local.set({ 'userId': id });
				
				} else {
					// If manual login is used
					chrome.storage.local.set({ 'userId': data.User.Id });
				}

				// User sucessfully authenticated
						chrome.storage.local.set({
							'user': JSON.stringify(data.User),
							'token': data.AccessToken
						})

				// Go to Today's upcoming
				$('#user-login').fadeOut('slow', function() {
					
					// Go to Today's upcoming.
					upcoming();
				});

			}).fail(function(){
					
				// Display message if manual login
				if ($('.slide').is(':hidden')) {
					
					// Display message with passField
					message('#msguser2', "Wrong username or password.");
				
				} else {
					
					// Display message with manual login
					message('#msguser', "Wrong username or password.");
				}
			});

			callback();
		}]
	});
}

function upcomingReset() {

	// This function is to reset upcoming
	// to it's original state.
	$('#header_signIn').html('<a id="back_getUser" class="headerButton">SIGN OUT</a>');
	$('#shortenedLogo').show();
	$('#dateSelector').show();
	$('#settings').show();
	// Reset the list of upcming shows
	$('#upcomingList').html('');
	// Hide content from getUser to avoid repetition
	$('#logo').hide();

	$('#yesterdayUp, #tomorrowUp, #settings').removeClass('dateSelect');
}

function upcoming() {
	

	// Save the state of the extension
	currentFunc('upcoming');

	// Setup the extension logo to active
	chrome.browserAction.setIcon({ path: "Icons/Icon_48_active.png" });

	// Reset upcoming to default
	upcomingReset();

	// When first loading, display today
	$('#todayUp').addClass('dateSelect');
	upContentDay = 0
	upContent(0);

	// When pressing the Yesterday button
	$('#yesterdayUp').off('click');
	$('#yesterdayUp').on('click', function() {

		$('#todayUp, #tomorrowUp, #settings').removeClass('dateSelect');
		$(this).addClass('dateSelect');

		upContentDay = -1;
		upContent(-1);
	});

	// When pressing the Today button
	$('#todayUp').off('click');
	$('#todayUp').on('click', function() {

		$('#yesterdayUp, #tomorrowUp, #settings').removeClass('dateSelect');
		$(this).addClass('dateSelect');

		upContentDay = 0;
		upContent(0);
	});

	// When pressing the Tomorrow button
	$('#tomorrowUp').off('click');
	$('#tomorrowUp').on('click', function() {

		$('#yesterdayUp, #todayUp, #settings').removeClass('dateSelect');
		$(this).addClass('dateSelect');
		
		upContentDay = 1;
		upContent(1);
	});

	// When pressing the settings button
	$('#settings').off('click');
	$('#settings').on('click', function() {

		$('#yesterdayUp, #todayUp, #tomorrowUp').removeClass('dateSelect');
		$(this).addClass('dateSelect');

		$('#upcomingList').fadeOut('fast', function() {

			// Load preferences
			chrome.storage.local.get(['checkIcon', 'hideWatched', 'hideDisliked'], function(result) {
			
				if (result['checkIcon'] == "corner") {
					document.getElementById('check-corner').checked = true;
				} else {
					document.getElementById('check-circle').checked = true;
				}

				if (result['hideWatched'] == undefined) {

					// First time opening settings
					document.getElementById('display_isWatched').checked = false;

				} else {
					// If hideWatched is stored in chrome storage
					document.getElementById('display_isWatched').checked = result['hideWatched'];
				}

				if (result['hideDisliked'] == undefined) {

					// First time opening settings
					document.getElementById('display_isDisliked').checked = false;
				} else {
					// If hideDisliked is stored in chrome storage
					document.getElementById('display_isDisliked').checked = result['hideDisliked'];
				}
			})

			// Fancy
			$('#preferences').fadeIn('fast');
		})
	})

	$('#savePref').off('click');
	$('#savePref').on('click', function() {

		// Check the settings checkIcon
		if (document.getElementById('check-corner').checked) {
			chrome.storage.local.set({ 'checkIcon': "corner" });
		} else if (document.getElementById('check-circle').checked) {
			chrome.storage.local.set({ 'checkIcon': "circle"})
		}

		// Check the settings display_isWatched is enabled or not
		var hideWatched = document.getElementById('display_isWatched').checked;	
		
		chrome.storage.local.set({ 'hideWatched': hideWatched });

		// Verify if settings display_isDisliked is enabled or not
		var hideDisliked = document.getElementById('display_isDisliked').checked;

		chrome.storage.local.set({ 'hideDisliked': hideDisliked});

		$('#settings').removeClass('dateSelect');
		$('#preferences').fadeOut('fast', function() {
			upcoming();
		});	
	})

	// When pressing the back button
	$('#back_getUser').off('click');
	$('#back_getUser').on('click', function() {

		$('#upcomingList').fadeOut(function() {
			
			$('#settings').hide();
			$('#preferences').hide();
			$('#dateSelector').hide();
			$('#shortenedLogo').hide();
			// Logout user and revoke token
			logoutUser();	
		});
	});

	// Fancy
	$('#upcomingList').fadeIn('slow');
}

function upContentReset() {
	
	// Reset the list of upcoming shows and displayed
	$('#upcomingList').html('').show();
	$('#preferences').hide();
}

// Addition to the empty array message
function upContent(day) {

		
	// Reset upContent to default
	upContentReset();

	// Make chrome storage sync
		async.auto({

			'storageUrl': storageUrl,
			'ajaxHeader': ajaxHeader,
			'storageUser': storageUser,
			'storageCheckIcon': storageCheckIcon,
			'storageWatched': storageWatched,
			'storageDisliked': storageDisliked,
			'upContent': ['storageUrl', 'ajaxHeader', 'storageUser', 'storageCheckIcon', 'storageWatched', 'storageDisliked', function getUserList(callback, result) {

				// Set shortcut to other functions variables
				var ipStorage = result.storageUrl.ipStorage;
				var portStorage = result.storageUrl.portStorage;
				var header = result.ajaxHeader;
				var userId = result.storageUser;
				var checkIcon = result.storageCheckIcon.checkIcon;
				var hideWatched = result.storageWatched.hideWatched;
				var hideDisliked = result.storageDisliked.hideDisliked;

				var resp = $.ajax({
				type: "GET",
				url: ipStorage + ":" + portStorage + "/emby/Shows/Upcoming?UserId=" + userId + "&Limit=30&Fields=AirTime,SeriesStudio,UserData",
				headers: header,
				dataType: "json",
				contentType: "application/json"
				
			}).error(function() {

				// Token has been revoked, 401 unauthorized
				logoutUser();

			}).done(function(data){

				var date = yyyymmdd(day);
				// Container for upcoming items
				var upItems = [];
				var upTrack = {};
				var path;
				
				var count = 0
				$.each(data.Items, function(key, val) {

					// Shortened PremiereDate to only include the date
					var shortDate = new Date(val.PremiereDate);
					shortDate = dateToString(shortDate)

					if (shortDate == date && upContentDay == day) {

						var process = true;
						// To display: Image, Series Name, S00E00,
						// Episode name, Air time, Studios
						var bannerImage = "background-image:url('" + ipStorage + ":" + portStorage + "/emby/Items/" + val.SeriesId + "/Images/banner?Width=366&Height=68')";
						var bannerLink = ipStorage + ":" + portStorage + "/emby/dashboard/itemdetails.html?id=" + val.SeriesId;
						var episode = (val.Name).substring(0, 21);
						var series = val.SeriesName;
						var seasonEp = ("S" + val.ParentIndexNumber + ", E" + val.IndexNumber);
						var airTime = val.AirTime
						var studio = val.SeriesStudio
						var available = "";
						var isWatched = val.UserData.Played;
						var isDisliked = false;
						var watchedIcon = "";
						var seriesIsFavorite = false;
						

						// Verify if airtime is undefined
						if (airTime == undefined) {

							airTime = "";
						}

						// Verify if the file is currently available to view via MB3
						if (val.LocationType === "FileSystem") {
							
							path = ipStorage + ":" + portStorage + "/emby/dashboard/itemdetails.html?id=" + val.Id
							// Mark as available episodes available to watch on MB3
							//available = "<a id=\"" + val.Id +"\" class=\"available\" href=\"" + path + "\">Available</a>";
							if (val.IsHD) {
								available = "<a class=\"quality\" href=\"" + path + "\">HD</a>";
							} else {
								available = "<a class=\"quality qualitysd\" href=\"" + path + "\">SD</a>"//"<a class=\"quality qualitysd\" href=\"" + path + "\">SD</a>";
							}
						}

						// Add ... if the episode name is too long
						if (episode.length > 20) {

							episode += "...";
						}

						// Verify if the item is watched
						if (isWatched === true) {

							watchedIcon = "<img class=\"check-"+ checkIcon +"\" src='/css/images/check_" + checkIcon + ".png'>"
						}

						if (hideDisliked) {
							// Additional query to find if show is disliked
							$.ajax({
								type: "GET",
								async: false,
								url: ipStorage + ":" + portStorage + "/emby/Users/" + userId +"/Items/" + val.SeriesId,
								headers: header,
								dataType: "json",
								contentType: "application/json",
								
							}).done(function(data2) {
								// Verify if the hide disliked is enabled
								if (hideDisliked && data2.UserData.Likes == false) {
									isDisliked = true;
								}
								/*if (data2.UserData.IsFavorite) {
									seriesIsFavorite = true;
								}*/
							})
						}

						// Verify if the hide watched is enabled and if the watched state is played
						if (hideDisliked === true && isDisliked === true) {
							console.log("Disliked!");
							// Don't push the item
							return;
						
						} else if (hideWatched === true && isWatched === true) {

							// Don't push the item
							return;

						} else if (available && upTrack[val.Name] != undefined)  {

							// Verify if the item is there twice
							listIndex = upTrack[val.Name];
							upItems.splice(listIndex, 1);
						}
						
						upItems.push("<div class=\"posterThumb\"><a class=\"bannerLink\" href=\"" + bannerLink + "\"><div id=\"" + val.Id + "\" favorite=\"" + seriesIsFavorite + "\" series=\"" + val.SeriesId + "\" disliked=\"" + isDisliked + "\" class=\"bannerItemImage\" style=\"" + bannerImage + "\">" + watchedIcon + "</div></a><div class=\"infoPanel\"><div class=\"seriesLink\">" + available + "</div><div class=\"seriesEp\">" + seasonEp + " - " + episode + "</div><div class=\"airtime\">" + airTime + " on " + studio + "</div></div></div>");
						upTrack[val.Name] = count
						count = Object.keys(upTrack).length
					}
				});

				// To display if no shows are available
				if (upItems.length == 0 && upContentDay == day) {
					
					if ($('#yesterdayUp').hasClass("dateSelect") == true) {
						
						// For yesterday only - past tense
						upItems.push("<div id=\"noItems\"><i>There are no shows to catch up on.</i></div><div id=\"noItemsFrown\"><i class=\"fa fa-frown-o\"></i></div>");
					
					} else {
						// For today and tomorrow - present tense
						upItems.push("<div id=\"noItems\"><i>There are no upcoming shows.</i></div><div id=\"noItemsFrown\"><i class=\"fa fa-frown-o\"></i></div>");
					}
				}

				// Create a div upItems that contains series
				$( "<div/>", {
					"class": "upItems",
					html: upItems.join( "" )
				}).appendTo('#upcomingList');

				// Link to series Id with the banner
				$('.bannerLink').off('click');
				$('.bannerLink').on('click', function() {

					path = $(this).attr("href");
					chrome.tabs.create({ url: path })
				})

				// Link to MB3 when the file is available
				$('.quality').off('click');
				$('.quality').on('click', function() {

					path = $(this).attr("href");
					chrome.tabs.create({ url: path });
				});

				// Link to MB3 server
				$('#shortenedLogo img').off('click');
				$('#shortenedLogo img').on('click', function() {
					
					// Open the server in a new tab
					path = ipStorage + ":" + portStorage + "/emby/dashboard/index.html";
					chrome.tabs.create({ url: path });
				});
			});

			callback();
		}]
	});
}


// logoutUser is completed
function logoutUser() {
	
	// Setup the icon to inactive 
	chrome.browserAction.setIcon({ path: "Icon.png" });

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
				url: ipStorage + ":" + portStorage + "/emby/Sessions/Logout/",
				headers: header,
				dataType: "json",
				contentType: "application/json"
			
			}).done(function(){
				
				// Reset storage for user credentials
				chrome.storage.local.remove('userId');
				chrome.storage.local.remove('user');
				chrome.storage.local.remove('token');
				chrome.storage.local.remove('hideWatched');
				chrome.storage.local.remove('hideDisliked');
				chrome.storage.local.remove('checkIcon')
				})

			callback();
		}]
	});

	// Get the user list to allow user to re-authenticate
	getUser();
}
