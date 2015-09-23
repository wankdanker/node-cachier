var oh = require('object-hash');
var map = require('dank-map');

var MemStore = require('./store-mem');

module.exports = Cache

function Cache(options) {
	var self = this;
	
	self.options = options || {};
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

	if (typeof key !== 'string') {
		key = oh.sha1(key);
	}

	//if only two args are passed, then we are just requesting a key and not doing a pass-through get
	if (arguments.length == 2 ) {
		return self.store.get(key, function (error, data){
			fn(error, data);
		});
	}
	
	self.store.get(key, function (error, data, info) {
		if (error) {
			//call fn to get the data and then cache it.
			fn(function (data) {
				//don't set anything if the data is undefined
				if (data === undefined) {
					return callback(data, null);
				}
				
				self.set(key, data, function (error, stat) {
					return callback(data, stat);
				});
			});
		}
		else {
			//skip calling fn, because we already have the cached value
			return callback(data, info);
		}
	});
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
