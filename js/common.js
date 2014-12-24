// Verify if deviceID exists
chrome.storage.local.get(null, function(items) {
  if (typeof items.deviceID === 'undefined') {
    // the device id is not there, so let's generate one
    device_id = guid();
    // and then store it so it is there next time
    chrome.storage.local.set({ deviceID: device_id });
  } else {
    // the device id is there, let's use it
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
