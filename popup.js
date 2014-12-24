$(document).ready(function() {
  /*$('#server-login').click(function() {
    $(this).hide();  
  });*/
  
  // When pressing connect
  $('#save_settings').click(function() {
    var $url = $('#setting_ip').val();
    var $ip = $('#setting_port').val();
    
    $('#msgconnect').append("<p>Connecting to server!</p>")
  });
});
