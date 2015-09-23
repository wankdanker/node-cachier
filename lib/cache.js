var oh = require('object-hash');
var map = require('dank-map');

function Cache(options) {
	var self = this;
	
	self.options = options || {};
	self.maxAge = self.options.maxAge || 600000;
	self.store = options.store || new Cache.MemStore();
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
	
	self.store.set(key, value, self.maxAge, callback);
};

Cache.MemStore = function () {
	var self = this;
	
	self.cache = {};
	self.reapInterval = 60000;
	
	setInterval(function() {
		self.reap();
	}, self.reapInterval)
};

Cache.MemStore.prototype.reap = function (key) {
	var self = this;
	
	if (key) {
		delete self.cache[key];
		return true;
	}
	
	var now = +new Date();
	
	var toDelete = map(self.cache, function (key, cacheObject) {
		if (now - cacheObject.cdate > cacheObject.maxAge) {
			return key;
		}
		else {
			return null;
		}
	}, true);
	
	map(toDelete, function (ix, key) {
		delete self.cache[key];
	});	
};

Cache.MemStore.prototype.empty = function () {
	var self = this;
	self.cache = {};
}

Cache.MemStore.prototype.get = function (key, callback) {
	var self = this;
	
	if (!(key in self.cache)) {
		return callback({ message : "not found"}, null);
	}
	else {
		return callback(null, self.cache[key].value, makeInfo(self.cache[key]));
	}
};

Cache.MemStore.prototype.getInfo = function (key, callback) {
	var self = this;
	
	if (!(key in self.cache)) {
		return callback({ message : "not found"}, null);
	}
	else {
		return callback(null, makeInfo(self.cache[key]));
	}
};

Cache.MemStore.prototype.set = function (key, data, maxAge, callback) {
	var self = this, cacheObject = { maxAge : maxAge };
	
	cacheObject.value = data;
	cacheObject.cdate = +new Date();
	
	self.cache[key] = cacheObject;
	
	return callback(null, makeInfo( cacheObject ));
};

function makeInfo(obj) {
	return {
		mtime : obj.cdate,
		ctime : obj.cdate,
		atime : obj.cdate,
		length : obj.value.length,
		maxAge : obj.maxAge
	};
}

module.exports = Cache;
