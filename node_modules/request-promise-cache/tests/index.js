
var path = require('path');
var fs = require('fs');
var assert = require('chai').assert;

var pkg = require('../package.json');
var request = require('../request-promise-cache');

process.on("unhandledRejection", function(reason, promise) {
    console.error("unhandledRejection", reason)
});

process.on("rejectionHandled", function(promise) {
    console.error("rejectionHandled", promise);
});

var NativePromise = global.Promise;
var BluebirdPromise = require('bluebird').Promise;
var QPromise = require('q').Promise;
var WhenPromise = require('when').Promise;

var promiseTypes = [
    {
        Promise: NativePromise,
        name: 'Native Promise'
    },
    {
        Promise: BluebirdPromise,
        name: 'Bluebird Promise'
    },
    {
        Promise: QPromise,
        name: 'Q Promise'
    },
    {
        Promise: WhenPromise,
        name: 'When Promise'
    }
];

describe(pkg.name + '@' + pkg.version + ' tests', function (done) {
    this.timeout(10000);

    Promise.all(promiseTypes.map(function(type) {
        return testPromiseLib(type);
    }))

    .then(done);
});

function testPromiseLib (type) {

    return new NativePromise(function(promiseLibTestResolve, promiseLibTestReject) {

        describe('Testing using `' + type.name + '`', function () {
            this.timeout(5000);

            var goodTestUrl = 'https://httpbin.org';

            // todo:
            // come back and fix this if and when I purchase that domain
            var badTestUrl = 'https://aziz.khoury';

            beforeEach(function (done) {
                request.cache.clear();
                request.use(type.Promise);
                done();
            });

            it('should fetch ' + goodTestUrl + '', function (done) {
                request({url: goodTestUrl, cacheKey: goodTestUrl})
                    .then(function (ret) {
                        assert.equal(/<html/.test(ret), true);
                        done();
                    });
            });

            it('should fetch ' + goodTestUrl + ' with resolveWithFullResponse=true', function (done) {
                request({url: goodTestUrl, cacheKey: goodTestUrl, resolveWithFullResponse: true})
                    .then(function (ret) {
                        assert.equal(/<html/.test(ret.body), true);
                        done();
                    });
            });

            it('should fetch ' + goodTestUrl + ' twice in a row, the second one should resolve quickly from cache', function (done) {
                var start1 = +new Date();
                var start2;
                var diff1;
                var diff2;

                request({url: goodTestUrl, cacheKey: goodTestUrl, resolveWithFullResponse: true})
                    .then(function (ret) {
                        start2 = +new Date();
                        diff1 = start2 - start1;

                        return request({url: goodTestUrl, cacheKey: goodTestUrl, resolveWithFullResponse: true});
                    })
                    .then(function (ret) {
                        assert.equal(ret.__fromCache, true, '__fromCache is from the previous request');
                        diff2 = (+new Date()) - start2;
                        assert.approximately(0, diff2, 10, 'within 10 millis');
                        done();
                    });
            });

            it('should fetch ' + goodTestUrl + ' twice in a row, without a cacheKey but with a cacheTTL, the second one should resolve quickly from cache', function (done) {
                var start1 = +new Date();
                var start2;
                var diff1;
                var diff2;

                request({url: goodTestUrl, cacheTTL: 3600, resolveWithFullResponse: true})
                    .then(function (ret) {
                        start2 = +new Date();
                        diff1 = start2 - start1;

                        return request({url: goodTestUrl, cacheTTL: 3600, resolveWithFullResponse: true});
                    })
                    .then(function (ret) {
                        assert.equal(ret.__fromCache, true, '__fromCache is from the previous request');
                        diff2 = (+new Date()) - start2;
                        assert.approximately(0, diff2, 10, 'within 10 millis');
                        done();
                    });
            });


            it('should fetch ' + goodTestUrl + ' twice in a row, then access cache and del the key, so the second one should not resolve from cache but re-fetch again', function (done) {
                request({url: goodTestUrl, cacheKey: goodTestUrl, cacheTTL: 1, resolveWithFullResponse: true})
                    .then(function (ret) {
                        request.cache.del(goodTestUrl);
                        return request({url: goodTestUrl, cacheKey: goodTestUrl, resolveWithFullResponse: true});
                    })
                    .then(function (ret) {
                        assert.notEqual(ret.__fromCache, true, '__fromCache should be here, this is a fresh fetch');
                        done();
                    });
            });

            it('should POST to ' + goodTestUrl + '/post twice in a row, so the second one should not resolve from cache but re-post again', function (done) {
                request({method: 'POST', url: goodTestUrl + '/post', cacheKey: goodTestUrl, resolveWithFullResponse: true})
                    .then(function (ret) {
                        return request({method: 'POST', url: goodTestUrl + '/post', cacheKey: goodTestUrl, resolveWithFullResponse: true});
                    })
                    .then(function (ret) {
                        assert.notEqual(ret.__fromCache, true, '__fromCache should be here, this is a fresh fetch');
                        done();
                    });
            });

            it('should fetch ' + goodTestUrl + ' twice at the same time, the second one should resolve when the first does', function (done) {
                var start1 = +new Date();
                var start2 = +new Date();

                var p1 = request({url: goodTestUrl, cacheKey: goodTestUrl}).then(function () {
                    return (+new Date()) - start1;
                });

                var p2 = request({url: goodTestUrl, cacheKey: goodTestUrl}).then(function () {
                    return (+new Date()) - start2;
                });

                Promise.all([p1, p2]).then(function (values) {
                    assert.approximately(values[0], values[1], 10, 'withing 10 millis or so');
                    done();
                });
            });


            it('should fetch ' + badTestUrl + ' and fail', function (done) {
                request({url: goodTestUrl, cacheKey: goodTestUrl})
                    .then(function () {
                        assert(true, 'this should not resolve!');
                        done();
                    })
                    .catch(function () {
                        done();

                        promiseLibTestResolve();
                    });
            });

            it('should not generate unhandled promise rejections', function (done) {
                var unhandledRejectionsNumber = 0;

                function unhandledRejectionHandler() {
                    unhandledRejectionsNumber++;
                }

                process.on('unhandledRejection', unhandledRejectionHandler);

                var params = {
                    url: badTestUrl,
                    method: 'get',
                    cacheKey: badTestUrl,
                    cacheTTL: 10000
                };

                var p1 = request(params);
                var p2 = request(params);

                Promise.all([p1, p2])
                    .catch(function noop() {});

                setTimeout(function () {
                    process.removeListener('unhandledRejection', unhandledRejectionHandler);

                    try {
                        assert.equal(unhandledRejectionsNumber, 0, 'The number of unhandled promise rejections');
                        done();
                    } catch (err) {
                        done(err);
                    }
                }, 100)
            });
        });
    });
}
