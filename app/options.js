
document.addEventListener("DOMContentLoaded", function () {
	let blackList = new Blacklist();
	constructBlacklist(blackList);
	configureAddButton(blackList);
});

function configureAddButton(blackList) {
	document.getElementById("addEntry").addEventListener("click", () => {
		let url = document.getElementById("newEntry").value;
		blackList.addEntry(url).then(() => {
			addBlacklistEntryToPage(url, blackList);
			document.getElementById("newEntry").value = "";
		}).catch((err) => {
			console.log(err);
		});
	});
}

function constructBlacklist(blackList) {
	blackList.getBlacklist().then((blacklistEntryArray) => {
		blacklistEntryArray.forEach(entry => {
			addBlacklistEntryToPage(entry.url, blackList);
		});
	});
}

function addBlacklistEntryToPage(url, blackList) {
	//create list item containing entry
	let listEntry = document.createElement("li");
	listEntry.className = "blacklistItem";

	//add the URL field
	let description = document.createElement("span");
	description.className = "blacklistedURL";
	description.textContent = url;

	//add the delete button and associated actions
	let removeAnchor = document.createElement("a");
	removeAnchor.className = "removeEntry";
	removeAnchor.textContent = "Remove";
	removeAnchor.setAttribute("data-entry", url);
	removeAnchor.href = "#";
	removeAnchor.addEventListener("click", (ev) => {
		blackList.removeEntry(url).then(() => {
			blacklistContainer.removeChild(ev.srcElement.parentElement);
		}).catch((err) => {
			console.error(`Error removing entry: ${err}`);
		});
	});

	//hook it all up 
	listEntry.appendChild(description);
	listEntry.appendChild(removeAnchor);
	document.getElementById("blacklistContainer").appendChild(listEntry);
}
