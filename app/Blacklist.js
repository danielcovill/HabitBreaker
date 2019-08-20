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

	addEntry(url) {
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

	isBlacklisted(url) {
		throw "Not Implemented";
	}
}