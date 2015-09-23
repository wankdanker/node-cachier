var Memcached = require('memcached'),
	crypto = require('crypto');

module.exports = MemcachedStore;

var MemcachedStore = function (serverLocations, options) {
	var self = this;
	
	self.memcached = new Memcached(serverLocations, options);
};

MemcachedStore.prototype.reap = function () {
	/*TODO*/
};

MemcachedStore.prototype.empty = function () {
	/*TODO*/
}

MemcachedStore.prototype.get = function (key, callback) {
	var self = this;
	
	key = self.hash(key); //JSON.stringify(key);
	
	self.memcached.get(key, function (err, result) {
		if (err) {
			return callback(err, null);
		}
		else if (result === false) {
			return callback(true, null);
		}
		else {
			var obj = result;
			
			return callback(null, obj);
		}
	});
};

MemcachedStore.prototype.set = function (key, cacheObject, maxAge, callback) {
	var self = this;
	
	var str = cacheObject, originalKey = key;
	maxAge = maxAge / 1000; //The cache api defines maxAge in milliseconds, but Memcached expiration is in seconds
	key = self.hash(key); //JSON.stringify(key);
	
	self.memcached.set(key, str, maxAge, function (err, success) {
		if (success == true) {
			return callback(null);
		}
		else {
			console.log("cache set error: ", originalKey, err)
			return callback(err);
		}
	});
};

MemcachedStore.prototype.hash = function (str) {
	var shasum = crypto.createHash('sha1');
	
	shasum.update(str);
	
	return shasum.digest('hex');
};

