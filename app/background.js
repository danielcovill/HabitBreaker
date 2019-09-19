let blacklist = new Blacklist();

// Check a request for a new page and if the redirect is not allowed
// redirect the user to the "are you sure" page.
function checkURL(requestDetails) {
	let url = new URL(requestDetails.url).hostname;
	if (!!window.browser) {
		return blacklist.isCurrentlyBlacklisted(url).then((isBlacklisted) => {
			if (isBlacklisted) {
				return { redirectUrl: browser.extension.getURL(`app/index.html?redirect=${encodeURIComponent(requestDetails.url)}`) };
			}
		});
	} else if (!!window.chrome) {
		//can't use promises here because chrome's webRequest.onBeforeRequest can't handle them
		if(blacklist.isCurrentlyBlacklisted(url)) {
			return { redirectUrl: chrome.extension.getURL(`app/index.html?redirect=${encodeURIComponent(requestDetails.url)}`) };
		}
	} else {
		throw "Unsupported browser";
	}
}

if (!!window.browser) {
	browser.webRequest.onBeforeRequest.addListener(
		checkURL,
		{ urls: ["<all_urls>"], types: ["main_frame"] },
		["blocking"]
	);

	browser.runtime.onMessage.addListener(function (request, sender) {
		switch (request.type) {
			case "createRedirectException":
				return blacklist.getMatchingBlacklistEntry(request.url).then((matchingBlacklistEntry) => {
					if(!!matchingBlacklistEntry) {
						return blacklist.addException(matchingBlacklistEntry.url, request.exceptionReason, (request.timeoutMins * 60));
					} else {
						throw `No matching exception entry for ${request.url}`;
					}
				});
			default:
				throw "Unexpected message to background";
		}
	});
} else if (!!window.chrome) {
	chrome.webRequest.onBeforeRequest.addListener(
		checkURL,
		{ urls: ["<all_urls>"], types: ["main_frame"] },
		["blocking"]
	);

	chrome.runtime.onMessage.addListener(function (request, sender) {
		switch (request.type) {
			case "createRedirectException":
				return blacklist.getMatchingBlacklistEntry(request.url).then((matchingBlacklistEntry) => {
					if(!!matchingBlacklistEntry) {
						return blacklist.addException(matchingBlacklistEntry.url, request.exceptionReason, (request.timeoutMins * 60));
					} else {
						throw `No matching exception entry for ${request.url}`;
					}
				});
			default:
				throw "Unexpected message to background";
		}
	});	
} else {
	throw "Unsupported browser";
}