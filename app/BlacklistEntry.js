class BlacklistEntry {

	//number of times this blacklist item has been excepted
	static exceptionCount(item) {
		if(!item || typeof item.reasons === "undefined") {
			throw "BlacklistEntry: Invalid item";
		}
		return item.reasons.length - 1;
	}

	//whether or not the current blacklist item is excepted
	static isExcepted(item) {
		if(!item || typeof item.exceptionTimeout === "undefined") {
			throw "BlacklistEntry: Invalid item";
		}
		if(!!item.exceptionTimeout) {
			return item.exceptionTimeout > Date.now();
		} else {
			return false;
		}
	}

	//current reason (or null if none) 
	static currentExceptionReason(item) {
		if(!item || typeof item.reasons === "undefined") {
			throw "BlacklistEntry: Invalid item";
		}
		if(item.reasons.length > 0) {
			return reasons[item.reasons.length - 1].reason;
		} else {
			return null;
		}
	}

	static createEntry(_url) {
		if(!_url) {
			throw "BlacklistEntry: Parameter missing";
		}
		let result = {};
		result.url = _url;
		result.exceptionTimeout = null;
		result.reasons = [];
		return result;
	}

	static createException(item, seconds, reason) {
		if(!item || typeof item.reasons === "undefined") {
			throw "BlacklistEntry: Invalid item";
		}
		if(!seconds || !reason) {
			throw "BlacklistEntry: Invalid parameter";
		}
		item.exceptionTimeout = new Date(Date.now() + (seconds * 1000));
		item.reasons.push({
			reason: reason, 
			duration: seconds,
			created: Date.now()
		});
	}
}