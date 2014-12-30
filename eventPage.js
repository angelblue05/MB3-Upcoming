var cache = "";

chrome.runtime.onMessage.addListener(function (request) {
    if (request.cmd === "savestate") {
        cache = $('body').html();
    } else if (request.cmd === "getstate") {
		if (cache != "") {
			$('body').html(cache);
		}
	}
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
    if (request.greeting == "hello")
        sendResponse({farewell: "goodbye"});
});
