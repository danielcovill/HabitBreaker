let redirectingFrom = "";

window.browser = (function () {
	return window.msBrowser ||
		window.browser ||
		window.chrome;
})();

function checkURL(requestDetails) {
	redirectingFrom = requestDetails.url;
	if (!isRedirectAllowed(redirectingFrom)) {
		return { redirectUrl: browser.extension.getURL("app/index.html") };
	}
}

browser.webRequest.onBeforeRequest.addListener(
	checkURL,
	{ urls: ["<all_urls>"], types: ["main_frame"] },
	["blocking"]
);

browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	switch (request.type) {
		case "getRedirectingFrom":
			return Promise.resolve(redirectingFrom);
		case "triggerRedirect":
			return overrideRedirect(sender.tab.id, redirectingFrom)
				.then(resolve => {

				},reject => {

				});
		default:
			throw "Unexpected message to background";
	}
});

function overrideRedirect(tabId, redirectUrl, reason, duration) {
	let hostUrl = new URL(redirectUrl).hostname;
	return browser.storage.sync.set({allowedDomains: hostUrl})
		.then(resolve => {
			browser.tabs.update(tabId, { redirectUrl });
		}, reject => {
			throw "Error setting allow url: " + reject;
		});
}

function isRedirectAllowed(url) {
	console.log("Bad code here - needs to be fixed");
	// get the "banned" list from storage
	// ignore any items that are currently excepted due to a timeout
	// is not allowed if the item is a regex match for any remaining item
	// else is allowed

	//temp code until I can implement something real
	let tempCodeRegex = new RegExp(".*reddit.com.*");
	if(url.match(tempCodeRegex)) {
		return false;
	}

	return true;
}