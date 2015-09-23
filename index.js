module.exports = require('./lib/cache');
module.exports.MemStore = require('./lib/store-mem');
module.exports.MaterMemStore = require('./lib/store-master-mem');
module.exports.RedisStore = require('./lib/store-redis');
module.exports.MemcachedStore = require('./lib/store-memcached');
module.exports.MultiStore = require('./lib/store-multistore');
