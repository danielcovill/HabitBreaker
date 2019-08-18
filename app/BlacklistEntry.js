class BlacklistEntry {

	//number of times this blacklist item has been excepted
	get exceptionCount() {
		return this.reasons.length - 1;
	}

	//whether or not the current blacklist item is excepted
	get isExcepted() {
		if(!!this.exceptionTimeout) {
			return this.exceptionTimeout > Date.now();
		} else {
			return false;
		}
	}

	//current reason (or null if none) 
	get currentExceptionReason() {
		if(this.reasons.length > 0) {
			return reasons[this.reasons.length - 1].reason;
		} else {
			return null;
		}
	}

	constructor(_url) {
		if(!_url) {
			throw "Parameter missing: URL";
		}
		this.url = _url;
		this.exceptionTimeout = null;
		this.reasons = [];
	}

	createException(seconds, reason) {
		this.reasons.push({
			reason: reason, 
			duration: seconds,
			created: Date.now()
		});
	}
}