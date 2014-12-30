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
