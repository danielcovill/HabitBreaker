class Blacklist {
	constructor() { }

	getBlacklist() {
		if (!!this.blacklistEntries) {
			return Promise.resolve(this.blacklistEntries);
		}

		if (!!window.browser) {
			return browser.storage.sync.get("blacklist").then((result) => {
				if(!!result.blacklist) {
					this.blacklistEntries = result.blacklist;
				} else {
					this.blacklistEntries = [];
				}
				return this.blacklistEntries;
			});
		} else if (!!window.chrome) {
			return new Promise((resolve, reject) => {
				chrome.storage.sync.get(["blacklist"], (result) => {
					if (!!chrome.runtime.lastError) {
						reject(chrome.runtime.lastError);
					} else {
						if(!!result.blacklist) {
							this.blacklistEntries = result.blacklist;
						} else {
							this.blacklistEntries = [];
						}
						resolve(this.blacklistEntries);
					}
				});
			});
		} else {
			throw("Unsupported browser");
		}
	}

	setBlacklist(updatedBlacklist) {
		if (!!window.browser) {
			return browser.storage.sync.set({ blacklist: updatedBlacklist });
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
			throw("Unsupported browser");
		}
	}

	/*
	* URL should come in as a pure domain with wildcards. The only valid charcaters 
	* are letters, numbers, hyphens, periods, and astrisks representing wildcards. 
	* The end of the URL is assumed to be a slash followed by a wildcard as well, 
	* though neithr should be explicitly represented. The protocol should be omitted.
	*/
	addEntry(url) {
		if(RegExp("[^a-zA-Z0-9-\.\*]+").test(url)) {
			return Promise.reject(`Invalid URL in entry ${url}`);
		}

		let newEntry = new BlacklistEntry(url);
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
	}

	removeEntry(url) {
		return this.getBlacklist().then((bl) => {
			let itemFound = false;
			for(let i = 0; i < bl.length; i++) {
				if(bl[i].url === url) {
					bl.splice(i, 1);
					itemFound = true;
				}
			}
			if(!itemFound) {
				throw "URL not found";
			} else {
				return bl;
			}
		}).then((bl) => {
			return this.setBlacklist(bl);
		});
	}

	addException(url, reason, seconds) {
		throw "Not Implemented";
	}

	isCurrentlyBlacklisted(url) {
		return this.getBlacklist().then((bl) => {
			for (const blacklistEntry of bl) {
				let regex = RegExp(blacklistEntry.url.replace(".","\\.").replace("*",".*") + "/.*");
				if(regex.test(url) && !blacklistEntry.isExcepted) {
					return true;
				}
			};
			return false;
		});
	}
}