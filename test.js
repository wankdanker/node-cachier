var test = require('tape');
var redis = require('redis');
var Cachier = require('./');

test('Default MemStore Usage', function (t) {
	var c = new Cachier();

	c.get('a'
		, function getUncached (key, cb) {
			return cb(null, "some value for the key")
		}
		, function done(err, data) {
			t.equals(data, "some value for the key")

			c.end(function () {
				t.end();
			});
		});
});

test('Error pass-through', function (t) {
	var c = new Cachier();

	c.get('a'
		, function getUncached (key, cb) {
			return cb(new Error('this is the error'))
		}
		, function done(err, data) {
			t.equals(err.message, "this is the error")

			c.end(function () {
				t.end();
			});
		});
});

test('Default RedisStore Usage', function (t) {
	var c = new Cachier({
		store : new Cachier.RedisStore(redis.createClient())
	});

	c.get('a'
		, function getUncached (key, cb) {
			return cb(null, "some value for the key")
		}
		, function done(err, data) {
			t.equals(data, "some value for the key")

			c.end(function (e) {
				t.end();
			});
		});
});

test('Functionize RedisStore Usage', function (t) {
	var c = new Cachier({
		store : new Cachier.RedisStore(redis.createClient())
	});

	var lookup = c.functionize(function (key, cb) {
		return cb(null, "this is the value of " + key);
	});

	lookup('a', function (err, data) {
		t.equals(data, "some value for the key")

		c.end(function (e) {
			t.end();
		});
	});
});
