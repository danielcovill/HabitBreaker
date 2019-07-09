import { filter } from "minimatch";

class BlacklistManager {
	// Blacklist objects are defined by their domainUrl as the key
	// 
	// Blacklist objects include the following fields:
	//	exceptionTime: local datetime of current exception expiration (UTC/Unix)
	//	exceptionReason: reason for current exception
	// 
	// Notes:
	// I had to throw special "chrome" cases in here because google doesn't 
	// return promises from sync calls natively
	//
	// User settings must all be prefixed with ":" since I'm using the domains
	// as keys in storage. This is how I'm filtering for getAllEntries

	constructor() {
	}

	// Get all blacklist items
	//
	// Returns
	// Promise - resolves to an array of blacklist items
	static getAllEntries() {
		if (!!window.chrome) {
			chrome.storage.sync.get(null, (result) => {
				if (!!chrome.runtime.lastError) {
					return Promise.reject(chrome.runtime.lastError);
				} else {
					return Promise.resolve(result.filter(this.filterSettingsToBlacklist));
				}
			});
		} else {
			browser.storage.sync.get().then((result) => {
				return Promise.resolve(result.filter(this.filterSettingsToBlacklist));
			});
		}
	}

	// Get a blacklist item by the domain name
	//
	// Returns
	// Promise - resolves to a blacklist item based on the URL, result is null 
	// if the URL isn't in the blacklist
	static getEntry(domainUrl) {
		if (!!window.chrome) {
			chrome.storage.sync.get(domainUrl, (result) => {
				if (!!chrome.runtime.lastError) {
					return Promise.reject(chrome.runtime.lastError);
				} else {
					return Promise.resolve(result);
				}
			});
		} else {
			return browser.storage.sync.get(domainUrl);
		}
	}

	// Add a domain to the blacklist
	// 
	// Parameters
	// domainUrl: The domain for the exception, only a domain root will be valid
	// 
	// Returns
	// Promise - resolved once domain is added, rejected if error or item already exists
	static createEntry(domainUrl) {
		let newBlacklistEntry = {
			[domainUrl]: {
				exceptionEnd: null,
				exceptionReason: null
			}
		}
		if (!!window.chrome) {
			chrome.storage.sync.get(domainUrl, (result) => {
				if (Object.keys(result).length > 0) {
					return Promise.reject("Domain exception already exists");
				} else {
					chrome.storage.sync.set(newBlacklistEntry, () => {
						if (!!chrome.runtime.lastError) {
							return Promise.reject(chrome.runtime.lastError);
						} else {
							return Promise.resolve();
						}
					});
				}
			});
		} else {
			browser.storage.sync.get(domainUrl).then((result) => {
				if (Object.keys(result).length > 0) {
					return Promise.reject("Domain exception already exists");
				} else {
					return browser.storage.sync.set(newBlacklistEntry);
				}
			})
		}
	}


	// Remove a domain from the blacklist
	// 
	// Parameters
	// domainUrl: The domain to be removed
	// 
	// Returns
	// Promise - resolved upon successful removal or no matching item
	static removeEntry(domainUrl) {
		if (!!window.chrome) {
			chrome.storage.sync.remove(domainUrl, () => {
				if (!!chrome.runtime.lastError) {
					return Promise.reject(chrome.runtime.lastError);
				} else {
					return Promise.resolve();
				}
			});
		} else {
			return browser.storage.sync.remove(domainUrl);
		}
	}

	// Create a temporary exception to a blacklist item
	// 
	// Parameters
	// domainUrl: The domain for the exception, only the domain root will be used
	// reason: Text explanation for why the user is making this exception
	// minutes: Number of minutes for the exception to be in place
	// 
	// Returns
	// Promise - rejected if the domainUrl doesn't exist or invalid parameter used
	static createTempoararyException(domainUrl, reason, minutes) {
		if (!!window.chrome) {
			chrome.storage.sync.get(domainUrl, (result) => {
				if (Object.keys(result).length === 0) {
					return Promise.reject("Domain exception does not exist");
				} else {
					let exceptionEnd = Date.now() + 60000 * minutes;
					chrome.storage.sync.set({ [domainUrl]: { "timeout": exceptionEnd, "reason": exceptionReason } }, function () {
						if (!!chrome.runtime.lastError) {
							return Promise.reject(chrome.runtime.lastError);
						} else {
							return Promise.resolve();
						}
					});
				}
			});
		} else {
			browser.storage.sync.get(domainUrl).then((result) => {
				if (Object.keys(result).length > 0) {
					return Promise.reject("Domain exception does not exist");
				} else {
					return browser.storage.sync.set({ [domainUrl]: { "timeout": exceptionEnd, "reason": exceptionReason } });
				}
			});
		}
	}

	static filterSettingsToBlacklist(settingEntry) {
		return !Object.keys(settingEntry)[0].startsWith(":");
	}
}
export { getAllEntries, getEntry, createEntry, removeEntry, createTempoararyException }