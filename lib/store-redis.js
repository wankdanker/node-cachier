var crypto = require('crypto');
var rk = require('redis-key');

module.exports = RedisStore;

function RedisStore (redis, opts) {
	var self = this;

	opts = opts || {};

	self.redis = redis;
	self.prefix = opts.prefix || 'cache';
	self.separator = opts.separator || ':';

	self.rk = rk.defaults(self.separator, self.prefix);
};

RedisStore.prototype.reap = function () {
	/*TODO*/
};

RedisStore.prototype.empty = function () {
	/*TODO*/
}

RedisStore.prototype.get = function (key, callback) {
	var self = this;

	key = self.rk(self.hash(key));

	self.redis.get(key, function (err, result) {
		if (err) {
			return callback(err, null);
		}
		else if (result === null) {
			return callback(true, null);
		}
		else {
			var obj = JSON.parse(result);

			return callback(null, obj);
		}
	});
};

RedisStore.prototype.set = function (key, cacheObject, maxAge, callback) {
	var self = this;

	var str = JSON.stringify(cacheObject);

	key = self.rk(self.hash(key));

	self.redis.setex(key, maxAge / 1000, str, function (err, success) {
		if (success == true) {
			return callback(null);
		}
		else {
			return callback(err);
		}
	});
};

RedisStore.prototype.hash = function (str) {
	var shasum = crypto.createHash('sha1');

	shasum.update(str);

	return shasum.digest('hex');
};

RedisStore.prototype.end = function (cb) {
	var self = this;

	self.redis.quit(cb);
};
