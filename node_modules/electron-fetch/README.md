
electron-fetch
==========

[![npm version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![coverage status][codecov-image]][codecov-url]

A light-weight module that brings `window.fetch` to Electron's background process.
Forked from [`node-fetch`](https://github.com/bitinn/node-fetch).

## Motivation

Instead of implementing `XMLHttpRequest` over Electron's `net` module to run browser-specific [Fetch polyfill](https://github.com/github/fetch), why not go from native `net.request` to `fetch` API directly? Hence `electron-fetch`, minimal code for a `window.fetch` compatible API on Electron's background runtime.

Why not simply use node-fetch? Well, Electron's `net` module does a better job than Node.js' `http` module at handling web proxies.


## Features

- Stay consistent with `window.fetch` API.
- Runs on both Electron and Node.js, using either Electron's `net` module, or Node.js `http` module as backend.
- Make conscious trade-off when following [whatwg fetch spec][whatwg-fetch] and [stream spec](https://streams.spec.whatwg.org/) implementation details, document known difference.
- Use native promise.
- Use native stream for body, on both request and response.
- Decode content encoding (gzip/deflate) properly, and convert string output (such as `res.text()` and `res.json()`) to UTF-8 automatically.
- Useful extensions such as timeout, redirect limit (when running on Node.js), response size limit, [explicit errors][] for troubleshooting.


## Difference from client-side fetch

- See [Known Differences](https://github.com/arantes555/electron-fetch/blob/master/LIMITS.md) for details.
- If you happen to use a missing feature that `window.fetch` offers, feel free to open an issue.
- Pull requests are welcomed too!


## Difference from node-fetch

- Removed node-fetch specific options, such as `compression`.
- Added electron-specific options to specify the `Session` & to enable using cookies from it.
- Added electron-specific option `useElectronNet`, which can be set to false when running on Electron in order to behave as Node.js.
- Removed possibility to use custom Promise implementation (it's 2018, `Promise` is available everywhere!).
- Removed the possibility to forbid content compression (incompatible with Electron's `net` module, and of limited interest)
- [`standard`-ized](http://standardjs.com) the code.

## Install

```sh
$ npm install electron-fetch --save
```


## Usage

```javascript
import fetch from 'electron-fetch'
// or
// const fetch = require('electron-fetch').default

// plain text or html

fetch('https://github.com/')
	.then(res => res.text())
	.then(body => console.log(body))

// json

fetch('https://api.github.com/users/github')
	.then(res => res.json())
	.then(json => console.log(json))

// catching network error
// 3xx-5xx responses are NOT network errors, and should be handled in then()
// you only need one catch() at the end of your promise chain

fetch('http://domain.invalid/')
	.catch(err => console.error(err))

// stream
// the node.js way is to use stream when possible

fetch('https://assets-cdn.github.com/images/modules/logos_page/Octocat.png')
	.then(res => {
		const dest = fs.createWriteStream('./octocat.png')
		res.body.pipe(dest)
	})

// buffer
// if you prefer to cache binary data in full, use buffer()
// note that buffer() is a electron-fetch only API

import fileType from 'file-type'

fetch('https://assets-cdn.github.com/images/modules/logos_page/Octocat.png')
	.then(res => res.buffer())
	.then(buffer => fileType(buffer))
	.then(type => { /* ... */ })

// meta

fetch('https://github.com/')
	.then(res => {
		console.log(res.ok)
		console.log(res.status)
		console.log(res.statusText)
		console.log(res.headers.raw())
		console.log(res.headers.get('content-type'))
	})

// post

fetch('http://httpbin.org/post', { method: 'POST', body: 'a=1' })
	.then(res => res.json())
	.then(json => console.log(json))

// post with stream from file

import { createReadStream } from 'fs'

const stream = createReadStream('input.txt')
fetch('http://httpbin.org/post', { method: 'POST', body: stream })
	.then(res => res.json())
	.then(json => console.log(json))

// post with JSON

const body = { a: 1 }
fetch('http://httpbin.org/post', { 
	method: 'POST',
	body:    JSON.stringify(body),
	headers: { 'Content-Type': 'application/json' },
})
	.then(res => res.json())
	.then(json => console.log(json))

// post with form-data (detect multipart)

import FormData from 'form-data'

const form = new FormData()
form.append('a', 1)
fetch('http://httpbin.org/post', { method: 'POST', body: form })
	.then(res => res.json())
	.then(json => console.log(json))

// post with form-data (custom headers)
// note that getHeaders() is non-standard API

import FormData from 'form-data'

const form = new FormData()
form.append('a', 1)
fetch('http://httpbin.org/post', { method: 'POST', body: form, headers: form.getHeaders() })
	.then(res => res.json())
	.then(json => console.log(json))

// node 7+ with async function

(async function () {
	const res = await fetch('https://api.github.com/users/github')
	const json = await res.json()
	console.log(json)
})()
```

See [test cases](https://github.com/arantes555/electron-fetch/blob/master/test/test.js) for more examples.


## API

### fetch(url[, options])

- `url` A string representing the URL for fetching
- `options` [Options](#fetch-options) for the HTTP(S) request
- Returns: <code>Promise&lt;[Response](#class-response)&gt;</code>

Perform an HTTP(S) fetch.

`url` should be an absolute url, such as `http://example.com/`. A path-relative URL (`/file/under/root`) or protocol-relative URL (`//can-be-http-or-https.com/`) will result in a rejected promise.

<a id="fetch-options"></a>
#### Options

The default values are shown after each option key.

```js
const defaultOptions = {
	// These properties are part of the Fetch Standard
	method: 'GET',
	headers: {},        // request headers. format is the identical to that accepted by the Headers constructor (see below)
	body: null,         // request body. can be null, a string, a Buffer, a Blob, or a Node.js Readable stream
	redirect: 'follow', // (/!\ only works when running on Node.js) set to `manual` to extract redirect headers, `error` to reject redirect
    signal: null,       // the AbortSignal from an AbortController instance.

	// The following properties are electron-fetch extensions
	follow: 20,         // (/!\ only works when running on Node.js) maximum redirect count. 0 to not follow redirect
	timeout: 0,         // req/res timeout in ms, it resets on redirect. 0 to disable (OS limit applies)
	size: 0,            // maximum response body size in bytes. 0 to disable
	session: session.defaultSession, // (/!\ only works when running on Electron) Electron Session object.,
	agent: null,        // (/!\ only works when useElectronNet is false) Node HTTP Agent.,
	useElectronNet: true, // When running on Electron, defaults to true. On Node.js, defaults to false and cannot be set to true.
	useSessionCookies: true, // (/!\ only works when running on Electron >= 7) Whether or not to automatically send cookies from session.,
	user: undefined,    // When running on Electron behind an authenticated HTTP proxy, username to use to authenticate
	password: undefined // When running on Electron behind an authenticated HTTP proxy, password to use to authenticate
}
```

##### Default Headers

If no values are set, the following request headers will be sent automatically:

Header            | Value
----------------- | --------------------------------------------------------
`Accept-Encoding` | `gzip,deflate`
`Accept`          | `*/*`
`Connection`      | `close`
`Content-Length`  | _(automatically calculated, if possible)_
`User-Agent`      | `electron-fetch/1.0 (+https://github.com/arantes555/electron-fetch)`

<a id="class-request"></a>
### Class: Request

An HTTP(S) request containing information about URL, method, headers, and the body. This class implements the [Body](#iface-body) interface.

Due to the nature of Node.js, the following properties are not implemented at this moment:

- `type`
- `destination`
- `referrer`
- `referrerPolicy`
- `mode`
- `credentials`
- `cache`
- `integrity`
- `keepalive`

The following electron-fetch extension properties are provided:

- `follow` (/!\ only works when running on Node.js)
- `counter` (/!\ only works when running on Node.js)
- `session` (/!\ only works when running on Electron)
- `agent` (/!\ only works when running on Node.js)
- `useElectronNet` (/!\ only works when running on Electron, throws when set to true on Node.js)
- `useSessionCookies` (/!\ only works when running on Electron >= 7. For electron < 11, it saves received cookies regardless of this option, but only sends them if true. For electron >= 11, it saves them only if true.)

See [options](#fetch-options) for exact meaning of these extensions.

#### new Request(input[, options])

<small>*(spec-compliant)*</small>

- `input` A string representing a URL, or another `Request` (which will be cloned)
- `options` [Options][#fetch-options] for the HTTP(S) request

Constructs a new `Request` object. The constructor is identical to that in the [browser](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request).

In most cases, directly `fetch(url, options)` is simpler than creating a `Request` object.

<a id="class-response"></a>
### Class: Response

An HTTP(S) response. This class implements the [Body](#iface-body) interface.

The following properties are not implemented in electron-fetch at this moment:

- `Response.error()`
- `Response.redirect()`
- `type`
- `redirected`
- `trailer`

#### new Response([body[, options]])

<small>*(spec-compliant)*</small>

- `body` A string or [Readable stream][node-readable]
- `options` A [`ResponseInit`][response-init] options dictionary

Constructs a new `Response` object. The constructor is identical to that in the [browser](https://developer.mozilla.org/en-US/docs/Web/API/Response/Response).

Because Node.js & Electron's background do not implement service workers (for which this class was designed), one rarely has to construct a `Response` directly.

<a id="class-headers"></a>
### Class: Headers

This class allows manipulating and iterating over a set of HTTP headers. All methods specified in the [Fetch Standard][whatwg-fetch] are implemented.

#### new Headers([init])

<small>*(spec-compliant)*</small>

- `init` Optional argument to pre-fill the `Headers` object

Construct a new `Headers` object. `init` can be either `null`, a `Headers` object, an key-value map object, or any iterable object.

```js
// Example adapted from https://fetch.spec.whatwg.org/#example-headers-class

const meta = {
  'Content-Type': 'text/xml',
  'Breaking-Bad': '<3'
}
const headers = new Headers(meta)

// The above is equivalent to
const meta = [
  [ 'Content-Type', 'text/xml' ],
  [ 'Breaking-Bad', '<3' ]
]
const headers = new Headers(meta)

// You can in fact use any iterable objects, like a Map or even another Headers
const meta = new Map()
meta.set('Content-Type', 'text/xml')
meta.set('Breaking-Bad', '<3')
const headers = new Headers(meta)
const copyOfHeaders = new Headers(headers)
```

<a id="iface-body"></a>
### Interface: Body

`Body` is an abstract interface with methods that are applicable to both `Request` and `Response` classes.

The following methods are not yet implemented in electron-fetch at this moment:

- `formData()`

#### body.body

<small>*(deviation from spec)*</small>

* Node.js [`Readable` stream][node-readable]

The data encapsulated in the `Body` object. Note that while the [Fetch Standard][whatwg-fetch] requires the property to always be a WHATWG `ReadableStream`, in electron-fetch it is a Node.js [`Readable` stream][node-readable].

#### body.bodyUsed

<small>*(spec-compliant)*</small>

* `Boolean`

A boolean property for if this body has been consumed. Per spec, a consumed body cannot be used again.

#### body.arrayBuffer()
#### body.blob()
#### body.json()
#### body.text()

<small>*(spec-compliant)*</small>

* Returns: <code>Promise</code>

Consume the body and return a promise that will resolve to one of these formats.

#### body.buffer()

<small>*(electron-fetch extension)*</small>

* Returns: <code>Promise&lt;Buffer&gt;</code>

Consume the body and return a promise that will resolve to a Buffer.

#### body.textConverted()

<small>*(electron-fetch extension)*</small>

* Returns: <code>Promise&lt;String&gt;</code>

Identical to `body.text()`, except instead of always converting to UTF-8, encoding sniffing will be performed and text converted to UTF-8, if possible.

<a id="class-fetcherror"></a>
### Class: FetchError

<small>*(electron-fetch extension)*</small>

An operational error in the fetching process. See [ERROR-HANDLING.md][] for more info.

## License

MIT


## Acknowledgement

Thanks to [github/fetch](https://github.com/github/fetch) for providing a solid implementation reference.
Thanks to [node-fetch](https://github.com/bitinn/node-fetch) for providing a solid base to fork.


[npm-image]: https://img.shields.io/npm/v/electron-fetch.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/electron-fetch
[travis-image]: https://img.shields.io/travis/arantes555/electron-fetch.svg?style=flat-square
[travis-url]: https://travis-ci.org/arantes555/electron-fetch
[codecov-image]: https://img.shields.io/codecov/c/github/arantes555/electron-fetch.svg?style=flat-square
[codecov-url]: https://codecov.io/gh/arantes555/electron-fetch
[ERROR-HANDLING.md]: https://github.com/arantes555/electron-fetch/blob/master/ERROR-HANDLING.md
[whatwg-fetch]: https://fetch.spec.whatwg.org/
[response-init]: https://fetch.spec.whatwg.org/#responseinit
[node-readable]: https://nodejs.org/api/stream.html#stream_readable_streams
[mdn-headers]: https://developer.mozilla.org/en-US/docs/Web/API/Headers
