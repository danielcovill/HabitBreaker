import "./BlacklistEntry";

class Blacklist {
	blacklistEntries = null;
	constructor() {	}

	getBlacklist() {
		if(this.blacklistEntries !== null) {
			return Promise.resolve(this.blacklistEntries);
		}

		if (!!window.chrome) {
			return new Promise((resolve, reject) => {
				chrome.storage.sync.get("blacklist", (result) => {
					if (!!chrome.runtime.lastError) {
						reject(chrome.runtime.lastError);
					} else {
						this.blacklistEntries = result;
						resolve(this.blacklistEntries);
					}
				});
			});
			
		} else {
			browser.storage.sync.get("blacklist").then((result) => {
				this.blacklistEntries = result;
				return result;
			});
		}
	}

	setBlacklist(updatedBlacklist) {
		if (!!window.chrome) {
			return new Promise((resolve, reject) => {
				chrome.storage.sync.set({blacklist: updatedBlacklist}, function() {
					if (!!chrome.runtime.lastError) {
						reject(chrome.runtime.lastError);
					} else {
						this.blacklistEntries = updatedBlacklist;
						resolve();
					}
				});
			});
		} else {
			return browser.storage.sync.set({blacklist: updatedBlacklist});
		}
	}

	addEntry(url) {
		let newEntry = new BlacklistEntry(url);
		this.getBlacklist().then((blacklist) => {
			if(blacklist.filter((entry) => (entry.url === url)).length > 0) {
				throw `Entry with URL ${url} already exists`;
			} else {
				blacklist.push(newEntry);
				return blacklist;
			}
		}).then((blacklist) => {
			return this.setBlacklist(blacklist);
		});
	}

	removeEntry(url) {
		throw "Not Implemented";
	}

	addException(url, reason, seconds) {
		throw "Not Implemented";
	}

	isBlacklisted(url) {
		throw "Not Implemented";
	}
}
export { addEntry, removeEntry, addException, isBlacklisted, getBlacklist };