$(document).ready(function() {
  
  $('#userSelect').hide();
  // When pressing the connect button
  $('#save_settings').click(function() {
    
    // Save user IP and port
    var $ip = $('#setting_ip').val();
    var $port = $('#setting_port').val();
    
    // Verify if $ip contains http/https
    if ($ip.indexOf('http://') == -1 && $ip.indexOf('https://') == -1) {
      $ip = 'http://' + $ip;
    };
    
    // Test the connection
    $('#msgconnect').append("<p>Connecting to server...</p>"); /* Message */
    
    // Test with the given IP and port
    $.getJSON($ip + ":" + $port + "/mediabrowser/Users/Public", function(data) {
      // Testing successful, save IP and port to storage
      chrome.storage.local.set({ ip: $ip });
      chrome.storage.local.set({ port: $port });
      
      // Verify if userID already exists
      chrome.storage.local.get(null, function(items) {
        // If userID doesn't exist, bring up user list
        if (typeof items.user_id === 'undefined') {
          getUser();  
        } else {
          headerSetup();
        }
      })
      }).fail(function() { /* Testing connection failed */
        $('#msgconnect').append("<p>Unable to connect. Please verify your IP or URL and port.</p>");
      });
  });
});

function getUser() {
  $('#msgconnect').hide();
  $('#userSelect').show();
  
  $getJSON(chrome.storage.local.get('ip') + ":" + chrome.storage.local.get('port') + "/mediabrowser/Users/AuthenticateByName", function(data) {
    $("#users").html('');
  })
};

function headerSetup() {
  ;
};
