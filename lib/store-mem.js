var map = require('dank-map');

module.exports = MemStore;

function MemStore () {
	var self = this;

	self.cache = {};
	self.reapInterval = 60000;

	self.interval = setInterval(function() {
		self.reap();
	}, self.reapInterval)
};

MemStore.prototype.reap = function (key) {
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

MemStore.prototype.empty = function () {
	var self = this;
	self.cache = {};
}

MemStore.prototype.get = function (key, callback) {
	var self = this;

	if (!(key in self.cache)) {
		return callback(new Error("not found"), null);
	}
	else {
		return callback(null, self.cache[key].value, makeInfo(self.cache[key]));
	}
};

MemStore.prototype.getInfo = function (key, callback) {
	var self = this;

	if (!(key in self.cache)) {
		return callback(new Error("not found"), null);
	}
	else {
		return callback(null, makeInfo(self.cache[key]));
	}
};

MemStore.prototype.set = function (key, data, maxAge, callback) {
	var self = this, cacheObject = { maxAge : maxAge };

	cacheObject.value = data;
	cacheObject.cdate = +new Date();

	self.cache[key] = cacheObject;

	return callback(null, makeInfo( cacheObject ));
};

MemStore.prototype.end = function (cb) {
	var self = this;

	clearInterval(self.interval);

	return cb();
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
