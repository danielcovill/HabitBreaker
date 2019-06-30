class BlacklistManager {
	// Blacklist objects are defined by
	//	domainUrl: string
	// 
	// Blacklist objects include the following fields:
	//  exceptionTime: local datetime of current exception expiration
	//  exceptionReason: reason for current exception
	// 
	// Notes:
	// I had to throw special "chrome" cases in here because google doesn't 
	// return promises from sync calls natively

	constructor() {
	}

	// Get a blacklist item by the domain name
	//
	// Returns
	// Promise - resolves to a blacklist item based on the URL, result null 
	// if the URL isn't in the blacklist
	getEntry(domainUrl) {
		if(!!window.chrome) {
			chrome.storage.sync.get(domainUrl, (result) => {
				return Promise.resolve(result);
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
	// Promise - resolved once domain is added
	addEntry(domainUrl) {
		let newBlacklistEntry = { 
			[domainUrl]: {
				exceptionTime: null,
				exceptionReason: null
			}
		}
		if(!!window.chrome) {
			chrome.storage.sync.set(newBlacklistEntry, () => {
				if(!!chrome.runtime.lastError) {
					return Promise.reject(chrome.runtime.lastError);
				} else {
					return Promise.resolve();
				}
			});
		} else {
			return browser.storage.sync.set(newBlacklistEntry);
		}
	}


	// Remove a domain from the blacklist
	// 
	// Parameters
	// domainUrl: The domain to be removed
	// 
	// Returns
	// Promise - resolved upon successful removal or no matching item
	removeEntry(domainUrl) {
		if(!!window.chrome) {
			chrome.storage.sync.remove(domainUrl, () => {
				if(!!chrome.runtime.lastError) {
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
	createTempoararyException(domainUrl, reason, minutes) {
		throw "Not Implemented";
	}
}
export { }