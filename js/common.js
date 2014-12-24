// Verify if deviceID exists
chrome.storage.local.get(null, function(items) {
  if (typeof items.deviceID === 'undefined') {
    // the deviceID is not there, generate a guid
    device_id = guid();
    // storing guid as deviceID for future use
    chrome.storage.local.set({ deviceID: device_id });
  } else {
    // the deviceID is there
    device_id = items.deviceID;
  }
});

// Generate a deviceID

// Generate serial with 4 alphanumerics
function S4() {
	return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
};

// Generate a full guid
function guid() {
	return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
};
