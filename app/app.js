let destination = null;

document.getElementById("redirectForm").addEventListener("submit", function (e) {
	e.preventDefault();
	let reason = e.srcElement.reason.value;
	let timeout = e.srcElement.timeout.value;

	//validation
	if(timeout <= 0) {
		throw "Invalid timeout";
	}

	//Log the reason with the timeout and move on
	browser.runtime.sendMessage({
		type: "createRedirectException",
		url: destination,
		timeoutMins: timeout,
		exceptionReason: reason
	}).then(() => {
		document.location = destination;
	}).catch((reason) => {
		console.error(reason);
	});
});

document.addEventListener("DOMContentLoaded", () => {
	destination = new URL(window.location.href).searchParams.get("redirect");
	document.getElementById("redirectingFrom").innerHTML = new URL(destination).hostname;
});