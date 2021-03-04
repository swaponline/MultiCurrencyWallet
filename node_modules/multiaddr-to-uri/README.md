# multiaddr-to-uri

[![Build Status](https://travis-ci.org/multiformats/js-multiaddr-to-uri.svg?branch=master)](https://travis-ci.org/multiformats/js-multiaddr-to-uri) [![dependencies Status](https://david-dm.org/multiformats/js-multiaddr-to-uri/status.svg)](https://david-dm.org/multiformats/js-multiaddr-to-uri) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)


> Convert a Multiaddr to a URI /dnsaddr/ipfs.io/http -> http://ipfs.io

## Install

```sh
npm install multiaddr-to-uri
```

## Usage

```js
const toUri = require('multiaddr-to-uri')

console.log(toUri('/dnsaddr/protocol.ai/https'))
// -> https://protocol.ai

console.log(toUri('/ip4/127.0.0.1/tcp/8080'))
// -> http://127.0.0.1:8080

console.log(toUri('/ip4/127.0.0.1/tcp/8080', { assumeHttp: false }))
// -> tcp://127.0.0.1:8080
```

Note:

* When `/tcp` is the last (terminating) protocol HTTP is assumed by default (implicit `assumeHttp: true`)
  * this means produced URIs will start with `http://` instead of `tcp://`
  * passing `{ assumeHttp: false }` disables this behavior
* Might be lossy - e.g. a DNSv6 multiaddr
* Can throw if the passed multiaddr:
    * is not a valid multiaddr
    * is not supported as a URI e.g. circuit

## Contribute

Feel free to dive in! [Open an issue](https://github.com/multiformats/js-multiaddr-to-uri/issues/new) or submit PRs.

## License

[MIT](LICENSE) © Alan Shaw
