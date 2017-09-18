var oh = require('object-hash');
var map = require('dank-map');

var MemStore = require('./store-mem');

module.exports = Cache

function Cache(options) {
	var self = this;

	options = options || {}

	self.options = options;
	self.maxAge = self.options.maxAge || 600000;
	self.store = options.store || new MemStore();
}

Cache.prototype.empty = function () {
	var self = this;

	self.store.empty();
};

Cache.prototype.reap = function (key) {
	var self = this;

	self.store.reap(key);
};

Cache.prototype.get = function (key, fn, callback) {
	var self = this;
	var originalKey = key;

	if (typeof key !== 'string') {
		key = oh.sha1(key);
	}

	//if only two args are passed, then we are just requesting a key and not doing a pass-through get
	if (arguments.length == 2 ) {
		return self.store.get(key, function (error, data) {
			fn(error, data);
		});
	}

	self.store.get(key, function (error, data, info) {
		if (error) {
			//call fn to get the data and then cache it.
			fn(originalKey, function (err, data) {
				//don't set anything if there was an error
				if (err) {
					return callback(err, data, null);
				}

				//don't set anything if the data is undefined
				if (data === undefined) {
					return callback(null, data, null);
				}

				self.set(key, data, function (error, stat) {
					if (error) {
						//TODO: make Cache an event emitter and emit this event
						//self.emit('error', error);
					}

					//we don't want to callback with the error that occurred in the
					//cache module because we are attempting to just pass
					//through the results of the call to `fn`
					return callback(null, data, stat);
				});
			});
		}
		else {
			//skip calling fn, because we already have the cached value
			return callback(null, data, info);
		}
	});
};

Cache.prototype.functionize = function (fn) {
	var self = this;

	return function (key, callback) {
		if (typeof key !== 'string') {
			key = oh.sha1(key);
		}

		self.store.get(key, function (error, data, info) {
			if (error) {
				//call fn to get the data and then cache it.
				fn(key, function (err, data) {
					//don't set anything if there was an error
					if (err) {
						return callback(err, data, null);
					}

					//don't set anything if the data is undefined
					if (data === undefined) {
						return callback(null, data, null);
					}

					self.set(key, data, function (error, stat) {
						if (error) {
							//TODO: make Cache an event emitter and emit this event
							//self.emit('error', error);
						}

						//we don't want to callback with the error that occurred in the
						//cache module because we are attempting to just pass
						//through the results of the call to `fn`
						return callback(null, data, stat);
					});
				});
			}
			else {
				//skip calling fn, because we already have the cached value
				return callback(null, data, info);
			}
		});
	}
};

Cache.prototype.getInfo = function (key, callback) {
	var self = this;

	self.store.getInfo(key, callback);
};

Cache.prototype.set = function (key, value, callback) {
	var self = this;

	if (typeof key !== 'string') {
		key = oh.sha1(key);
	}

	self.store.set(key, value, self.maxAge, callback);
};

Cache.prototype.end = function (cb) {
	var self = this;

	try {
		self.store.end(cb);
	}
	catch (e) {
		//most likely store doen't have an end function
		return cb(e);
	}
};
