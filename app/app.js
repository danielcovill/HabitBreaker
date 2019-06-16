window.browser = (function () {
  return window.msBrowser ||
    window.browser ||
    window.chrome;
})();

// Clicking the proceed button asks the background process to keep going
document.getElementById("proceed").addEventListener("click", function() {
	let timeout = document.getElementById("timeout").value;
	browser.runtime.sendMessage({
		type: "triggerRedirect",
		timeoutMins: timeout
	});
});

document.getElementById("redirectForm").addEventListener("submit", function (e) {
	e.preventDefault();
	let reason = e.srcElement.reason.value;
	let timeout = e.srcElement.timeout.value;
	
	//TODO: log the reason, set the timeout, call for a redirect from background.js
	debugger;
});

document.addEventListener("DOMContentLoaded", function () {
	browser.runtime.sendMessage({
		type: "getRedirectingFrom"
	}).then(function (redirectingFrom) {
		document.getElementById("redirectingFrom").innerHTML = new URL(redirectingFrom).hostname;
	});
});