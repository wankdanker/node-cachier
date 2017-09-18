module.exports = require('./lib/cache');
lazyRequire(module.exports, 'MemStore', './lib/store-mem');
lazyRequire(module.exports, 'MaterMemStore', './lib/store-master-mem');
lazyRequire(module.exports, 'RedisStore', './lib/store-redis');
lazyRequire(module.exports, 'MemcachedStore', './lib/store-memcached');
lazyRequire(module.exports, 'MultiStore', './lib/store-multistore');

function lazyRequire (target, key, path) {
  Object.defineProperty(target, key, {
    get : function () {
      return require(path);
    }
    , enumerable : true
    , configurable : true
  });
}
