# iso-random-stream [![NPM Version](https://img.shields.io/npm/v/iso-random-stream.svg)](https://www.npmjs.com/package/iso-random-stream) [![NPM Downloads](https://img.shields.io/npm/dt/iso-random-stream.svg)](https://www.npmjs.com/package/iso-random-stream) [![NPM License](https://img.shields.io/npm/l/iso-random-stream.svg)](https://www.npmjs.com/package/iso-random-stream) [![Build Status](https://travis-ci.org/hugomrdias/iso-random-stream.svg?branch=master)](https://travis-ci.org/hugomrdias/iso-random-stream) [![codecov](https://codecov.io/gh/hugomrdias/iso-random-stream/badge.svg?branch=master)](https://codecov.io/gh/hugomrdias/iso-random-stream?branch=master)

> Random bytes stream for node and browser. Uses [crypto.randomBytes(size[, callback])](https://nodejs.org/api/crypto.html#crypto_crypto_randombytes_size_callback) in node and [Crypto.getRandomValues()](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues) in the browser. We use Buffer to keep the interfaces and returns values consistent, so make sure your bundler includes `buffer` in the browser.

## Install

```
$ npm install iso-random-stream
```

## Usage

```js
const randomStream = require('iso-random-stream');

randomStream('100').pipe(process.stdout);
```

## API

### randomStream(size)

Returns a [`stream.Readable`](https://nodejs.org/api/stream.html#stream_readable_streams). By default, it produces infinite data.

#### size

Type: `number`
Default: `Infinity`

Number of random bytes to produce.

## License

MIT © [Hugo Dias](http://hugodias.me)
