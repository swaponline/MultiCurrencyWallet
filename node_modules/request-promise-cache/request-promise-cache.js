/*
    promisified version of request with cache support
*/

var request = require('request');
var cache = require('nano-cache');
var P = global.Promise;

if (! P) {
    console.warn('your nodejs version does not natively support global.Promise,'
        + ' you must pass your custom class, i.e. request.use(require("bluebird")); '
        + ' see https://github.com/akhoury/request-promise-cache#other-promise-libraries'
    )
}

function hashCode (str) {
    // https://stackoverflow.com/a/34842797/493756
    return str.split('')
        .reduce(function (prevHash, currVal) { return ((prevHash << 5) - prevHash) + currVal.charCodeAt(0) }, 0);
}

function promisifyAndCachifyRequest (r, options) {
    r = r || request.defaults(options || {});
    r._loading = {};
    r._cache = new cache();
    r._cache.on('del', function (key) {
        delete r._loading[key];
    });
    r._cache.on('clear', function () {
        r._loading = {};
    });

    var requestPromiseCache = function(params) {
        var cacheEntry = {};
        var promise = cacheEntry.promise = new P(function(resolve, reject) {

            var fresh = params.fresh;
            var cacheKey = params.cacheKey;
            var cacheTTL = params.cacheTTL;
            var cacheLimit = params.cacheLimit;

            if ((cacheTTL || cacheLimit) && !cacheKey) {
                cacheKey = hashCode(JSON.stringify(params));
            }

            delete params.fresh;
            delete params.cacheKey;
            delete params.cacheTTL;
            delete params.cacheLimit;

            if ((fresh || (params.qs && params.qs._)) && cacheKey) {
                r._cache.del(cacheKey);
            }

            var get = (params.method || 'get').toLowerCase() === 'get';

            if(get && cacheKey) {
                var hit = r._cache.get(cacheKey);
                if (hit) {
                    // only works if resolveWithFullResponse=true
                    // since body would be a primitive string and can't add property to it.
                    // and I don't want to use `new String(body)`
                    // anyways, this is not documented and I only use it for tests
                    hit.__fromCache = true;
                    resolve(hit);
                    return;
                }

                if (r._loading[cacheKey]) {
                    r._loading[cacheKey].promise.done ? r._loading[cacheKey].promise.done(resolve, reject) : r._loading[cacheKey].promise.then(resolve, reject);
                    return;
                }

                r._loading[cacheKey] = cacheEntry;
            }

            var resolveWithFullResponse = params.resolveWithFullResponse;
            delete params.resolveWithFullResponse;

            r(params, function(error, response, body) {
                var ret = resolveWithFullResponse ? response : body;

                if (error || response.statusCode < 200 || response.statusCode > 299) {
                    reject(error || response);
                } else {
                    cacheKey && get && r._cache.set(cacheKey, ret, {ttl: cacheTTL, limit: cacheLimit});
                    resolve(ret);
                }
                delete r._loading[cacheKey];
            });
        });

        return promise;
    };

    requestPromiseCache.loading = r._loading;
    requestPromiseCache.cache = r._cache;
    return requestPromiseCache;
}

function defaults (defaults) {
    var r = request.defaults(defaults || {});
    return promisifyAndCachifyRequest(r);
}
var requestPromiseCache = promisifyAndCachifyRequest();

// original request()
requestPromiseCache.original = request;

// same as the original.defaults, but promisified
requestPromiseCache.defaults = defaults;

requestPromiseCache.use = function (CustomPromise) {
    P = CustomPromise;
    return requestPromiseCache;
};

module.exports = requestPromiseCache;

