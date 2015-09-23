/*
 * TODO:
 * 		When a key is found in .get(), be sure to set() it in all stores that do not have it
 * 		this should be pretty easy because just need to set() in stores with index less than
 * 		the index of the store that found it, and we don't care about the callbacks.
 */

var Queue = require('dank-queue'),
	map = require('dank-map');

var MultiStore = function (stores) {
	var self = this;

	self.stores = stores || [];
};

MultiStore.prototype.reap = function () {
	var self = this;
	
	map(self.stores, function (ix, store) {
		store.reap();
	});
};

MultiStore.prototype.empty = function () {
	var self = this;
	
	map(self.stores, function (ix, store) {
		store.empty();
	});
}

MultiStore.prototype.get = function (key, callback) {
	var self = this,
		index = 0;

	Queue.doWhile(function (whileNext) {
		if (index > self.stores.length - 1) {
			return callback({ message : "not found"}, null);
		}

		var store = self.stores[index];

		store.get(key, function (err, data, objCache) {
			if (!err) {
				return callback(null, data, objCache);
			}

			index++;
			return whileNext(true);
		});
	});
};

MultiStore.prototype.set = function (key, cacheObject, maxAge, callback) {
	var self = this,
		callbackCalled = false,
		returnObject = null;
	
	map(self.stores, function (ix, store) {
		store.set(key, cacheObject, maxAge, function () {
			if (!callbackCalled) {
				callbackCalled = true;
				return callback(null, returnObject);
			}
		});
	});
};

module.exports = MultiStore;
