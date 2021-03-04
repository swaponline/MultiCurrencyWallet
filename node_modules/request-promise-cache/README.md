# request-promise-cache
Request promise with cache

### 2.0.0 Breaks backward compatibility
The `resolve`d first argument is no longer `{response, body, ?error}` but just the `body`. But, you can pass in `resolveWithFullResponse=true` to the `request({..params})` to get the full `response` object instead of the body.

### Other promise libraries?

By default, this module uses the native javascript [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) introduced in Node.js 0.12+, however you can use it with others, by passing your own `Promise` constructor

```javascript

// if you want to use bluebird for example
// just do this once, somewhere in your app, ideally whatever file loads first, i.e. app.js
var request = require('request-promise-cache').use( require('bluebird').Promise )

// you dont have to do it again in the same app's other files
```

#### Tested with
* [bluebird](https://github.com/petkaantonov/bluebird)
* [when](https://github.com/cujojs/when)
* [q](https://github.com/kriskowal/q)
* and native [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

if you want me to test another one, just add it and make a pull request to the [`promiseTypes`](https://github.com/akhoury/request-promise-cache/blob/e81bce12c13d47562bd1f2324a65cdc12a2072cb/tests/index.js#L22-L39)

## Usage

```javascript
var request = require('request-promise-cache');

var query = { recordId: 27 };

var queryString = Object.keys(query).sort().map(function (k) { return k + '=' query[k] }).join('&');
var cacheKey = url + '?' + queryString;

var url = 'http://google.com';
request({
    url: url,
    cacheKey: url,
    cacheTTL: 3600,
    cacheLimit: 12,
    /* bust the cache and get fresh results
    qs: query || {
        _: +new Date()
    },
    */
    // like https://github.com/request/request-promise#get-the-full-response-instead-of-just-the-body
    resolveWithFullResponse: false,
  })
  .then(function(body) {
    // ...
  })
  .catch(function(error) {
    // ...
  });
```

## Options

All of the original [request library's options](https://github.com/request/request#requestoptions-callback), plus the following:

* `cacheKey: string`, the cache key use, typically, it's just the URL, maybe add the query string
* `cacheTTL: milliseconds`, automatically expire a cache entry after Y number of milliseconds, if used with `cacheLimit`, whichever comes first will take precedence
* `cacheLimit: integer`, automatically expire a cache entry after X amount of reads, if used with `cacheTTL`, whichever comes first will take precedence
* `fresh: true/false`, delete the cached entry and get a fresh one
* `qs._: 123456789 /* anything truthy */`, same as `fresh` however, this query param will be sent over to the remote server, so it will, most likely, bypass the cache on the other end if there is one
* `resolveWithFullResponse: true/false`, copied from [request-promise](https://github.com/request/request-promise#get-the-full-response-instead-of-just-the-body) options, defaults to `false`, basically instead of resolving with the `body`, it uses the `response`, which then you need to do `response.body` to access the `body`

## Asynchronous calls with the same `cacheKey`

If you make 2 or more requests with the same `cacheKey` at the _same_ time, and of course, the response comes back within the `cacheTTL` of the first request, __only__ 1 request will go out, the rest will wait for it and resolve at the _same_ time.

## Extras

On the returned `request` object, you can:

* `request.original` access the original request function,
* `request.defaults()` another request object function generator, which is used exactly like the original [`request.defaults`](https://github.com/request/request#requestdefaultsoptions) but this one will return a __promisified__ request with the __caching__.
* `request.cache` is the cache instance using, which is a [`nano-cache`](https://github.com/akhoury/nano-cache) instance, say you need to `request.cache.clear()`

## License

MIT
