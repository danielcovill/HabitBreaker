let redirectingFrom = "";
let blacklist = new Blacklist();

// Check a request for a new page and if the redirect is not allowed
// redirect the user to the "are you sure" page.
function checkURL(requestDetails) {
	//need to figure out how to de-promise this so it works
	blacklist.isCurrentlyBlacklisted(requestDetails.url).then((isBlacklisted) => {
		if(isBlacklisted) {
			return { redirectUrl: browser.extension.getURL("app/index.html") };
		} else {

		}
	})
}

browser.webRequest.onBeforeRequest.addListener(
	checkURL,
	{ urls: ["<all_urls>"], types: ["main_frame"] },
	["blocking"]
);

browser.runtime.onMessage.addListener(function (request, sender) {
	switch (request.type) {
		case "getBlacklistObject":
			return Promise.resolve(blacklist);
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
		.then((resolve) => {
			browser.tabs.update(tabId, { redirectUrl });
		}, reject => {
			throw "Error setting allow url: " + reject;
		});
}