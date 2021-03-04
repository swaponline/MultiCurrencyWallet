# js-libp2p-secio

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://protocol.ai)
[![](https://img.shields.io/badge/project-libp2p-yellow.svg?style=flat-square)](http://libp2p.io/)
[![](https://img.shields.io/badge/freenode-%23libp2p-yellow.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23libp2p)
[![Discourse posts](https://img.shields.io/discourse/https/discuss.libp2p.io/posts.svg)](https://discuss.libp2p.io)
[![](https://img.shields.io/codecov/c/github/libp2p/js-libp2p-secio.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-secio)
[![](https://img.shields.io/travis/libp2p/js-libp2p-secio.svg?style=flat-square)](https://travis-ci.com/libp2p/js-libp2p-secio)
[![Dependency Status](https://david-dm.org/libp2p/js-libp2p-secio.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-secio)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
![](https://img.shields.io/badge/npm-%3E%3D3.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/Node.js-%3E%3D6.0.0-orange.svg?style=flat-square)


> SECIO implementation in JavaScript

This repo contains the JavaScript implementation of secio, an encryption protocol used in libp2p. This is based on this [go implementation](https://github.com/libp2p/go-libp2p-secio).

## Lead Maintainer

[Friedel Ziegelmayer](https://github.com/dignifiedquire/)

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Contribute](#contribute)
- [License](#license)

## Install

```sh
npm install libp2p-secio
```

## Usage

```js
const secio = require('libp2p-secio')
```

## API

This module exposes a crypto interface, as defined in the [js-interfaces](https://github.com/libp2p/js-interfaces)

[ » API Docs ](https://github.com/libp2p/js-interfaces/tree/master/src/crypto#api)

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/libp2p/js-libp2p-secio/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

[MIT](LICENSE)
