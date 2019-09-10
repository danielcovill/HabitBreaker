import * as BlacklistEntry from "./BlacklistEntry.js";

class Blacklist {
	constructor() { }

	// Browser
	// Returns: Promise resolving with blacklist entries array
	// Chrome
	// Returns: blacklist entries array
	getBlacklist() {
		if (!!window.browser) {
			if (!!this.blacklistEntries) {
				return Promise.resolve(this.blacklistEntries);
			}
			return browser.storage.sync.get("blacklist").then((result) => {
				if (!!result.blacklist) {
					this.blacklistEntries = result.blacklist;
				} else {
					this.blacklistEntries = [];
				}
				return this.blacklistEntries;
			});
		} else if (!!window.chrome) {
			if (!!this.blacklistEntries) {
				return this.blacklistEntries;
			}
			//can't use promises here because chrome's webRequest.onBeforeRequest can't handle them
			chrome.storage.sync.get(["blacklist"], (result) => {
				if (!!chrome.runtime.lastError) {
					throw chrome.runtime.lastError;
				} else {
					if (!!result.blacklist) {
						this.blacklistEntries = result.blacklist;
					} else {
						this.blacklistEntries = [];
					}
					return this.blacklistEntries;
				}
			});
		} else {
			throw "Unsupported browser";
		}
	}

	// Sets the blacklist to the updated array passed in
	// Returns: Promise resolving with no arguments
	setBlacklist(updatedBlacklist) {
		if (!!window.browser) {
			return browser.storage.sync.set({ blacklist: updatedBlacklist }).then(() => {
				this.blacklistEntries = updatedBlacklist;
			});
		} else if (!!window.chrome) {
			return new Promise((resolve, reject) => {
				chrome.storage.sync.set({ blacklist: updatedBlacklist }, function () {
					if (!!chrome.runtime.lastError) {
						reject(chrome.runtime.lastError);
					} else {
						this.blacklistEntries = updatedBlacklist;
						resolve();
					}
				});
			});
		} else {
			throw "Unsupported browser";
		}
	}

	// Gets the first blacklist entry that matches a given URL
	// Returns: First BlacklistEntry to match a given URL, empty if none
	getMatchingBlacklistEntry(url) {
		if(!!window.browser) {
			return this.getBlacklist().then((bl) => {
				let itemFound = false;
				for(let i = 0; i < bl.length && !itemFound; i++) {
					if(this.convertUrlToRegex(bl[i].url).test(url)) {
						return bl[i];
					}
				}
			});
		} else if (!!window.chrome) {
			return new Promise((resolve) => {
				let bl = this.getBlacklist();
				let itemFound = false;
				for(let i = 0; i < bl.length && !itemFound; i++) {
					if(this.convertUrlToRegex(bl[i].url).test(url)) {
						resolve(bl[i]);
					}
				}
				resolve();
			});
		} else {
			throw "Unsupported browser";
		}
	}

	// Adds an entry to the blacklist and updates storage
	// Returns: Promise resolving with no arguments
	// Notes:
	// URL should come in as a pure domain with wildcards. The only valid charcaters 
	// are letters, numbers, hyphens, periods, and astrisks representing wildcards. 
	// Only the hostname is considered currently (not the path). The protocol should
	// be omitted.
	addEntry(url) {
		if (RegExp("[^a-zA-Z0-9-\.\*]+").test(url)) {
			throw `Invalid URL in entry ${url}`;
		}

		let newEntry = BlacklistEntry.createEntry(url);

		if(!!window.browser) {
			return this.getBlacklist().then((bl) => {
				if (bl.filter((entry) => (entry.url === url)).length > 0) {
					throw `Entry with URL ${url} already exists`;
				} else {
					bl.push(newEntry);
					return bl;
				}
			}).then((bl) => {
				return this.setBlacklist(bl);
			});
		} else if (!!window.chrome) {
			return new Promise((resolve) => {
				let bl = this.getBlacklist();
				if (bl.filter((entry) => (entry.url === url)).length > 0) {
					throw `Entry with URL ${url} already exists`;
				} else {
					bl.push(newEntry);
				}
				resolve(this.setBlacklist(bl));
			});
		} else {
			throw "Unsupported browser";
		}
	}

	// Removes an entry from the blacklist and updates storage
	// Returns: Promise resolving with no arguments
	removeEntry(url) {
		if(!!window.browser) {
			return this.getBlacklist().then((bl) => {
				let itemFound = false;
				for (let i = 0; i < bl.length && !itemFound; i++) {
					if (bl[i].url === url) {
						bl.splice(i, 1);
						itemFound = true;
					}
				}
				if (!itemFound) {
					throw "URL not found";
				} else {
					return bl;
				}
			}).then((bl) => {
				return this.setBlacklist(bl);
			});
		} else if (!!window.chrome) {
			return new Promise((resolve) => {
				let bl = this.getBlacklist();
				let itemFound = false;
				for (let i = 0; i < bl.length && !itemFound; i++) {
					if (bl[i].url === url) {
						bl.splice(i, 1);
						itemFound = true;
					}
				}
				if (!itemFound) {
					throw "URL not found";
				}
				resolve(this.setBlacklist(bl));
			});
		} else {
			throw "Unsupported browser";
		}

	}

	// Adds an exception to a blacklist entry and updates storage
	// Returns: Promise resolving with no arguments or failure of URL not found
	addException(url, reason, seconds) {
		if (!!window.browser) {
			return this.getBlacklist().then((bl) => {
				let itemFound = false;
				for (let i = 0; i < bl.length && !itemFound; i++) {
					if (bl[i].url === url) {
						BlacklistEntry.createException(bl[i], seconds, reason);
					}
				}
				if (!itemFound) {
					throw "URL not found";
				} else {
					return bl;
				}
			}).then((bl) => {
				return this.setBlacklist(bl);
			});
		} else if (!!window.chrome) {
			let bl = this.getBlacklist();
			let itemFound = false;
			for (let i = 0; i < bl.length && !itemFound; i++) {
				if (bl[i].url === url) {
					BlacklistEntry.createException(bl[i], seconds, reason);
				}
			}
			if (!itemFound) {
				throw "URL not found";
			} 
			return this.setBlacklist(bl);
		} else {
			throw "Unsupported browser";
		}
	}

	// Browser
	// Returns: Promise resolving to a boolean showing blacklist status of a url
	// Chrome
	// Returns: A boolean showing blacklist status of a url
	// Notes: can't use promises here because chrome's webRequest.onBeforeRequest can't handle them
	isCurrentlyBlacklisted(url) {
		if (!!window.browser) {
			return this.getBlacklist().then((bl) => {
				for (const blacklistEntry of bl) {
					if (this.convertUrlToRegex(blacklistEntry.url).test(url) && !BlacklistEntry.isExcepted(blacklistEntry)) {
						return true;
					}
				}
				return false;
			});
		} else if (!!window.chrome) {
			return new Promise((resolve) => {
				let bl = this.getBlacklist();
				for (const blacklistEntry of bl) {
					if (this.convertUrlToRegex(blacklistEntry.url).test(url) && !BlacklistEntry.isExcepted(blacklistEntry)) {
						resolve(true);
					}
				}
				resolve(false);
			});
		} else {
			throw "Unsupported browser";
		}

	}

	// Returns: string with dots escaped and stars converted to regex wildcards
	convertUrlToRegex(url) {
		return RegExp(url.replace(/\./g,"\\.").replace(/\*/g, ".*"));
	}
}