window.browser = (function () {
  return window.msBrowser ||
    window.browser ||
    window.chrome;
})();

document.getElementById("proceed").addEventListener("click", function() {
	browser.runtime.sendMessage({
		type: "triggerRedirect"
	});
});

document.addEventListener("DOMContentLoaded", function () {
	browser.runtime.sendMessage({
		type: "getRedirectingFrom"
	}).then(function (redirectingFrom) {
		document.getElementById("redirectingFrom").innerHTML = new URL(redirectingFrom).hostname;
	});
});