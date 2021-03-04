var assert = require('chai').assert;
var NanoCache = require('../index');


// allows for faster testing as we don't need timeouts
var fakeNow;
NanoCache.prototype.now = function () {
    return fakeNow || (new Date()).getTime();
};

var testCache = function (cache) {

    beforeEach(function () {
        fakeNow = null;
        cache.init();
        cache.clear();
    });

    it('should be able to get', function () {
        var key = "foo";
        var val = {
            foo : 123,
            bar : {
                a : 123,
                b : 123
            }
        };
        cache.set(key, val);

        var ret = cache.get(key);

        assert.deepEqual(val, ret);
    });

    it('should be able to set', function () {
        var key = "foo";
        var val = 123;
        cache.init({
            compress : false
        });
        var bytes = JSON.stringify(val).length;

        var ret = cache.set(key, val);
        var stats = cache.stats();

        assert.equal(val, ret, "should return a value on set");
        assert.equal(stats.bytes, bytes, "should increase in size");

    });


    it('should be able to delete', function () {
        var key = "foo";
        var val = {
            foo : 123,
            bar : {
                a : 123,
                b : 123
            }
        };
        cache.set(key, val);
        var d = cache.del(key);
        var g = cache.get(key);
        var stats = cache.stats();
        assert.deepEqual(d, val, "del should return value");
        assert.deepEqual(g, null, "get should return null");
        assert.equal(stats.bytes, 0, "should have no bytes");
    });

    it('should be fire events on actions', function (done) {
        var key = "foo";
        var val = {
            foo : 123,
            bar : {
                a : 123,
                b : 123
            }
        };
        cache.once('set', function (setKey) {
            assert.equal(setKey, key, "should have been the set key");
        });
        cache.once('get', function (accessedKey) {
            assert.equal(accessedKey, key, "should have been the accessed key");
        });
        cache.once('del', function (deleteKey) {
            assert.equal(deleteKey, key, "should have been the deleted key");
        });

        this.timeout(1000);
        cache.once('clear', function () {
            // if this doesn't fire in 1000ms, timeout this test
            done();
        });
        cache.set(key, val);
        cache.get(key);
        cache.del(key);
        cache.clear(key);
    });

    it('should be a clone of original data', function () {
        var key = "foo";
        var val = {
            foo : 123
        };
        cache.set(key, val);
        var ret = cache.get(key);
        ret.foo = 456;
        assert.equal(val.foo, 123);
    });

    it('should be able to info', function () {

        var key = "foo";
        var val = {
            foo : 123,
            bar : {
                a : 123,
                b : 123
            }
        };

        var options = {
            ttl: 60,
            limit: 100
        };
        fakeNow = 1000;

        cache.set(key, val, options);

        var g = cache.get(key);
        assert.deepEqual(g, val, "has equal value on get");

        var ret = cache.info(key);

        assert.deepEqual(val, ret.value, "has equal value on info");
        assert.equal(ret.updated, fakeNow, "has update time");
        assert.isOk(ret.bytes > 0, "has a size");
        assert.isOk(ret.accessed, fakeNow, "has access time");
        assert.equal(ret.hits, 1, "has been one hit");
        assert.equal(ret.expires, fakeNow + options.ttl, "has expiry");
        assert.equal(ret.limit, options.limit, "has limit");
    });

    it('should support stats', function () {
        var val = "12345678"; // 10 inc quotes
        cache.init({
            compress : false
        });
        cache.set("a", val);
        cache.set("b", val);
        cache.set("c", val);

        cache.get("a");
        cache.get("b");
        cache.get("c");
        cache.get("d");

        var stats = cache.stats();

        assert.equal(stats.count, 3, "should have right count");
        assert.equal(stats.bytes, 30, "should have right bytes");
        assert.equal(stats.hits, 3, "should have right hits");
        assert.equal(stats.misses, 1, "should have right misses");
    });

    it("should expire based on item time limit", function () {
        var key = "foo";
        var val = 123;
        var ret;

        var options = {
            ttl: 100
        };

        fakeNow = 1000;
        cache.set(key, val, options);

        fakeNow = 1099;
        ret = cache.get(key);
        assert.deepEqual(ret, val, "should return object during interval");

        fakeNow = 1100;

        ret = cache.get(key);
        assert.deepEqual(ret, null, "should return null after time passes");
    });

    it("should expire based on global time limit", function () {
        var key = "foo";
        var val = 123;
        var ret;

        cache.init({
            ttl: 100
        });

        fakeNow = 1000;
        cache.set(key, val);

        fakeNow = 1099;
        ret = cache.get(key);
        assert.deepEqual(ret, val, "should return object during interval");

        fakeNow = 1100;

        ret = cache.get(key);
        assert.deepEqual(ret, null, "should return null after time passes");
    });

    it("should have interval based expiry without using get", function (done) {
        var val = 123;

        fakeNow = 100;
        cache.set("one", val, { ttl : 15 });
        cache.set("two", val, { ttl : 30 });

        var stats = cache.stats();
        assert.equal(stats.count, 2, "should have an item after set");

        setTimeout(function () {
            fakeNow = 110;
            var s = cache.stats();
            cache.get("two"); // gets trigger async cleanup
            assert.equal(s.count, 2, "should still have 2 items after 15s interval");

            fakeNow = 120; // advance time for async cleanup
        }, 10);

        setTimeout(function () {
            fakeNow = 125;
            var s = cache.stats();
            assert.equal(s.count, 1, "should have 1 item after 25 sec interval");
            done();
        }, 20);
    });

    it("should expire based on item hit limit", function () {
        var key = "foo";
        var val = 123;
        var ret;
        var options = {
            limit: 3
        };

        cache.set(key, val, options);

        ret = cache.get(key);
        assert.deepEqual(ret, val, "should return object on first hit");

        ret = cache.get(key);
        assert.deepEqual(ret, val, "should return object on second hit");

        ret = cache.get(key);
        assert.deepEqual(ret, val, "should return object on third hit");

        ret = cache.get(key);
        assert.deepEqual(ret, null, "should return null on fourth hit");
    });

    it("should evict based on total cache size", function () {
        var val = "12345678"; // 10 inc quotes
        var ret;
        cache.init({
            compress: false,
            bytes : 25
        });
        fakeNow = 100;
        cache.set("one", val);

        fakeNow += 1;
        cache.set("two", val);

        fakeNow += 1;
        cache.get("one");

        fakeNow += 1;
        cache.set("three", val);

        fakeNow += 1;
        ret = cache.get("two");

        var stats = cache.stats();
        assert.deepEqual(ret, null, "the least accessed item should expire");
        assert.equal(stats.evictions, 1, "stats say 1 item evicted");
    });


    it("should support enabling and disabling compression", function () {
        var val = { a : "......", bar : { a : "......", b: "......" } };

        cache.init({
            compress : false
        });

        cache.set("one", val);
        cache.set("two", val);

        var info = cache.info("two");
        assert.isNotOk(info.compressed, "flag reflects not compressed");

        var uncompressed = cache.stats().bytes;

        cache.init({
            compress : true
        });
        cache.set("one", val);
        cache.set("two", val);

        info = cache.info("two");
        assert.isOk(info.compressed, "flag reflects is compressed");

        var compressed = cache.stats().bytes;
        var two = cache.get("two");

        assert.isBelow(compressed, uncompressed, "should be smaller");
        assert.deepEqual(two, val, "should not corrupt value");
    });
};

describe('Singleton', function () {
    testCache(NanoCache);
});

describe('Instance', function () {
    testCache(new NanoCache());
});
