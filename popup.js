var processing = 0;
var jsonf = "?format=json";

$(document).ready(function() {
  
    // When pressing the connect button
    if (processing == 0) {
        $('#save_settings').click(function() {
          
            // Prevent user from pressing connect multiple times.
            processing = 1;
            // Save user IP and port
            var ip = $('#setting_ip').val();
            var port = $('#setting_port').val();
          
            // Verify if the IP contains http/https
            if (ip.toLowerCase().indexOf('http://') == -1 && ip.toLowerCase().indexOf('https://') == -1) {
                ip = 'http://' + ip;
            }
          
            $('#msgconnect').html("<p>Connecting to server...</p>"); /* Message */
          
            // Test with the given IP and port
            $.getJSON(ip + ":" + port + "/mediabrowser/Users/Public" + jsonf, function(data) {
                // Testing successful, save IP and port to storage
                chrome.storage.local.set({ ip: ip });
                chrome.storage.local.set({ port: port });
    
                // WORK IN PROGRESS
            
                // Display the list of users
                $.each(data, function(key, val) {
                    $('#userSelect').append(val['Name'] + "<br />\n")
                });
                
                $("#server-login").hide();
				$("#userSelect").show();
           
            // Verify if userID already exists
            /*chrome.storage.local.get(null, function(items) {
              // If userID doesn't exist, bring up user list
              if (typeof items.user_id === 'undefined') {
                getUser();  
              } else {
                headerSetup();
              }
            })*/
            }).fail(function() { /* Testing failed */
                $('#msgconnect').html("<p>Unable to connect. Please verify your IP or URL and port.</p>");
            });
        });
    
        processing = 0;
    });
});

function getUser() {
  $('#msgconnect').hide();
  $('#userSelect').show();
  
  $.getJSON(chrome.storage.local.get('ip') + ":" + chrome.storage.local.get('port') + "/mediabrowser/Users/AuthenticateByName", function(data) {
    $("#users").html('');
  });
}

function headerSetup() {
  
}
