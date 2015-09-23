/*

This needs to be in the master process when using SimpleCluster:

var cluster = new Cluster();

var memStore = new utils.Cache({ store : new utils.Cache.MemStore()});

cluster.on('worker', function (worker) {
	worker.on('message', function (msg) {
		if (msg.cacheSet) {
			memStore.set(msg.key, msg.data, function (err, data) {
				worker.send({
					cacheSetResponse : true,
					id : msg.id,
					error : err,
					data : data
				});
			});
		}
		else if (msg.cacheGet) {
			memStore.get(msg.key, function (err, data, objCache) {
				worker.send({
					cacheGetResponse : true,
					id : msg.id,
					error : err,
					data : data
				});
			});
		}
	});
});

cluster.start();

 */

var uuid = require('uuid'),
	callbacks = {};

process.on("message", function (msg) {
	if (msg.cacheSetResponse) {
		callbacks[msg.id](msg.error, msg.data);
	}
	else if (msg.cacheGetResponse) {
		callbacks[msg.id](msg.error, msg.data)
	}
	
	delete callbacks[msg.uuid];
});

module.exports = MasterMemstore;

function MasterMemstore () {
	var self = this;
};

MasterMemstore.prototype.reap = function () {
	var self = this;
	/*TODO*/
};

MasterMemstore.prototype.empty = function () {
	var self = this;
	/*TODO*/
}

MasterMemstore.prototype.get = function (key, callback) {
	var self = this,
		id = uuid();
	
	callbacks[id] = callback;
	
	process.send({
		cacheGet : true,
		id : id,
		key : key
	});
};

MasterMemstore.prototype.set = function (key, cacheObject, maxAge, callback) {
	var self = this,
		id = uuid();
	
	callbacks[id] = callback;
	
	process.send({
		cacheSet : true,
		id : id,
		key : key,
		data : cacheObject,
		maxAge : maxAge
	});
};

