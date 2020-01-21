document.addEventListener("DOMContentLoaded", function () {
	let blacklist = new Blacklist();

	//ToDo: find another way to do this because this requires the tabs permission
	getCurrentTab().then((currentTab) => {
		blacklist.isCurrentlyBlacklisted(currentTab[0].url);
		url = new URL(currentTab[0].url);
		currentUrlIsExempt = url.protocol == "moz-extension:" || url.protocol == "about:";
		[...document.getElementsByTagName("div")].forEach(divElement => {
			divElement.style.display = currentUrlIsExempt ? "none" : "block";
		});
	}).then((isCurrentPageBlocked) => {
		document.getElementById("allowedOrDenied").innerHTML = isCurrentPageBlocked ? "blocked" : "allowed";
	});
});

async function getCurrentTab() {
	if (!!window.browser) {
		return window.browser.tabs.query({ currentWindow: true, active: true });
	}
	else if (!!window.chrome) {
		window.chrome.tabs.query({ currentWindow: true, active: true }, (result) => {
			return Promise.resolve(result);
		});
	}
	else {
		throw "Unsupported browser";
	}
}
