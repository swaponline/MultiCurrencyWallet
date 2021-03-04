# js-multihashing-async <!-- omit in toc -->

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-multiformats-blue.svg?style=flat-square)](https://github.com/multiformats/multiformats)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](https://webchat.freenode.net/?channels=%23ipfs)
[![codecov](https://img.shields.io/codecov/c/github/multiformats/js-multihashing-async.svg?style=flat-square)](https://codecov.io/gh/multiformats/js-multihashing-async)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/multiformats/js-multihashing-async/ci?label=ci&style=flat-square)](https://github.com/multiformats/js-multihashing-async/actions?query=branch%3Amaster+workflow%3Aci+)

> Use all the functions in [multihash](https://github.com/multiformats/multihash).

## Lead Maintainer <!-- omit in toc -->

[Hugo Dias](https://github.com/hugomrdias)

### Notice  <!-- omit in toc -->
> This module is moving to async/await starting from 0.7.0.
> The last minor version to support callbacks is 0.6.0, any backports will merged to the branch `callbacks` and released under  `>0.6.0 <0.7.0`.

#### Wait, why, how is this different from Node `crypto`?  <!-- omit in toc -->

This module just makes working with multihashes a bit nicer.
[js-multihash](//github.com/multiformats/js-multihash) is only for
encoding/decoding multihashes, and does not depend on other libs.
This module will depend on various implementations for each hash.
It currently uses `crypto` and [`sha3`](https://github.com/phusion/node-sha3) in Node.js.
In the browser [`webcrypto`](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto)
and [`browserify-sha3`](https://github.com/wanderer/browserify-sha3) are used.

## Table of Contents  <!-- omit in toc -->

- [Install](#install)
  - [In Node.js through npm](#in-nodejs-through-npm)
  - [Use in a browser with browserify, webpack or any other bundler](#use-in-a-browser-with-browserify-webpack-or-any-other-bundler)
  - [Use in a browser Using a script tag](#use-in-a-browser-using-a-script-tag)
- [Usage](#usage)
- [Examples](#examples)
  - [Multihash output](#multihash-output)
- [API](#api)
- [Contribute](#contribute)
- [License](#license)

## Install

### In Node.js through npm

```bash
$ npm install --save multihashing-async
```

```js
const multihashing = require('multihashing-async')
```

### Use in a browser with browserify, webpack or any other bundler

The code published to npm that gets loaded on require is in fact a ES5 transpiled
version with the right shims added. This means that you can require it and use with
your favourite bundler without having to adjust asset management process.

```js
const multihashing = require('multihashing-async')
```

### Use in a browser Using a script tag

Loading this module through a script tag will make the `multihashing` obj
available in the global namespace.

```html
<script src="https://unpkg.com/multihashing-async/dist/index.min.js"></script>
<!-- OR -->
<script src="https://unpkg.com/multihashing-async/dist/index.js"></script>
```

## Usage

```js
const multihashing = require('multihashing-async')
const bytes = new TextEncoder().encode('beep boop')

const mh = await multihashing(bytes, 'sha1')

// Use `.digest(...)` if you want only the hash digest (drops the prefix indicating the hash type).
const digest = await multihashing.digest(bytes, 'sha1')

// Use `.createHash(...)` for the raw hash functions
const hash = multihashing.createHash('sha1')
const digest = await hash(bytes)
```

## Examples

### Multihash output

```js
const multihashing = require('multihashing-async')
const bytes = new TextEncoder().encode('beep boop')

const mh = await multihashing(bytes, 'sha1')
console.log(mh)
// => <Uint8Array 11 14 7c 83 57 57 7f 51 d4 f0 a8 d3 93 aa 1a aa fb 28 86 3d 94 21>

const mh = await multihashing(bytes, 'sha2-256')
console.log(mh)
// => <Uint8Array 12 20 90 ea 68 8e 27 5d 58 05 67 32 50 32 49 2b 59 7b c7 72 21 c6 24 93 e7 63 30 b8 5d dd a1 91 ef 7c>

const mh = await multihashing(bytes, 'sha2-512')
console.log(mh)
// => <Uint8Array 13 40 14 f3 01 f3 1b e2 43 f3 4c 56 68 93 78 83 77 1f a3 81 00 2f 1a aa 5f 31 b3 f7 8e 50 0b 66 ff 2f 4f 8e a5 e3 c9 f5 a6 1b d0 73 e2 45 2c 48 04 84 b0 ...>
```

## API

https://multiformats.github.io/js-multihashing-async/


## Contribute

Contributions welcome. Please check out [the issues](https://github.com/multiformats/js-multihashing-async/issues).

Check out our [contributing document](https://github.com/multiformats/multiformats/blob/master/contributing.md) for more information on how we work, and about contributing in general. Please be aware that all interactions related to multiformats are subject to the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

[MIT](LICENSE) © Protocol Labs Inc.
