var crypto = require('crypto')
	;
	//zlib = require('zlib');

module.exports = RedisStore;

function RedisStore (redis) {
	var self = this;
	
	//options.return_buffers = true;
	
	self.redis = redis;
};

RedisStore.prototype.reap = function () {
	/*TODO*/
};

RedisStore.prototype.empty = function () {
	/*TODO*/
}

RedisStore.prototype.get = function (key, callback) {
	var self = this;
	
	key = "cache:" + self.hash(key);
	
	self.redis.get(key, function (err, result) {
		if (err) {
			return callback(err, null);
		}
		else if (result === null) {
			return callback(true, null);
		}
		else {
			//zlib.gunzip(result, function (err, data) {
// 				if (err) {
// 					console.error(err);
// 					return callback(err, null);
// 				}
				var obj = JSON.parse(result); 
			
				return callback(null, obj);
			//});
		}
	});
};

RedisStore.prototype.set = function (key, cacheObject, maxAge, callback) {
	var self = this;
	
	var str = JSON.stringify(cacheObject);
	
	key = "cache:" + self.hash(key);
	
	//zlib.gzip(str, function (err, data) {
		self.redis.setex(key, maxAge / 1000, str, function (err, success) {
			if (success == true) {
				return callback(null);
			}
			else {
				return callback(err);
			}
			
		});
	//});
};

RedisStore.prototype.hash = function (str) {
	var shasum = crypto.createHash('sha1');
	
	shasum.update(str);
	
	return shasum.digest('hex');
};

