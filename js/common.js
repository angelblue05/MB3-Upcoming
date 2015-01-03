// Verify if deviceId exists
chrome.storage.local.get(null, function(items) {
  if (typeof items.deviceId === 'undefined') {
    // the deviceId is not there, generate a guid
    deviceId = guid();
    // storing guid as deviceID for future use
    chrome.storage.local.set({ 'deviceId': deviceId });
  } else {
    // the deviceId is there
    deviceId = items.deviceId;
  }
});

// Media Browser header
function ajaxHeader() {
        

        var userId;
        var token;
        var version = chrome.app.getDetails().version;
        
        // Verify if userId and token exists
        chrome.storage.local.get(null, function(items) {
                
                if (typeof items.userId != 'undefined') {
                        userId = items.userId;
                }

                if (typeof items.token != 'undefined') {
                        token = items.token;
                }
        });

        return {'Authorization':'MediaBrowser, UserId="' + userId + '", Client="MB3 Upcoming", Device="Chrome", DeviceId="' + deviceId + '", Version="' + version + '"', 'X-MediaBrowser-Token': token }
}

// Generate serial with 4 alphanumerics
function S4() {
	

        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
};

// Generate a full guid
function guid() {
	

        return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
};
