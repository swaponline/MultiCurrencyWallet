'use strict';
const mimicFn = require("mimic-fn");
const mapAgeCleaner = require("map-age-cleaner");
const cacheStore = new WeakMap();
/**
[Memoize](https://en.wikipedia.org/wiki/Memoization) functions - An optimization used to speed up consecutive function calls by caching the result of calls with identical input.

@param fn - Function to be memoized.

@example
```
import mem = require('mem');

let i = 0;
const counter = () => ++i;
const memoized = mem(counter);

memoized('foo');
//=> 1

// Cached as it's the same arguments
memoized('foo');
//=> 1

// Not cached anymore as the arguments changed
memoized('bar');
//=> 2

memoized('bar');
//=> 2
```
*/
const mem = (fn, { cacheKey, cache = new Map(), maxAge } = {}) => {
    if (typeof maxAge === 'number') {
        // TODO: Drop after https://github.com/SamVerschueren/map-age-cleaner/issues/5
        // @ts-expect-error
        mapAgeCleaner(cache);
    }
    const memoized = function (...arguments_) {
        const key = cacheKey ? cacheKey(arguments_) : arguments_[0];
        const cacheItem = cache.get(key);
        if (cacheItem) {
            return cacheItem.data;
        }
        const result = fn.apply(this, arguments_);
        cache.set(key, {
            data: result,
            maxAge: maxAge ? Date.now() + maxAge : Infinity
        });
        return result;
    };
    try {
        // The below call will throw in some host environments
        // See https://github.com/sindresorhus/mimic-fn/issues/10
        mimicFn(memoized, fn);
    }
    catch (_a) { }
    cacheStore.set(memoized, cache);
    return memoized;
};
/**
Clear all cached data of a memoized function.

@param fn - Memoized function.
*/
mem.clear = (fn) => {
    const cache = cacheStore.get(fn);
    if (!cache) {
        throw new TypeError('Can\'t clear a function that was not memoized!');
    }
    if (typeof cache.clear !== 'function') {
        throw new TypeError('The cache Map can\'t be cleared!');
    }
    cache.clear();
};
module.exports = mem;
