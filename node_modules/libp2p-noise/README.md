# js-libp2p-noise

![npm](https://img.shields.io/npm/v/libp2p-noise)
[![Build Status](https://travis-ci.com/NodeFactoryIo/js-libp2p-noise.svg?branch=master)](https://travis-ci.com/NodeFactoryIo/js-libp2p-noise)

[![](https://img.shields.io/badge/project-libp2p-yellow.svg?style=flat-square)](https://libp2p.io/)
![](https://img.shields.io/github/issues-raw/nodefactoryio/js-libp2p-noise)
![](https://img.shields.io/github/license/nodefactoryio/js-libp2p-noise)
![](https://img.shields.io/badge/yarn-%3E%3D1.17.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/Node.js-%3E%3D10.19.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/browsers-last%202%20versions%2C%20not%20ie%20%3C%3D11-orange)
[![Discourse posts](https://img.shields.io/discourse/https/discuss.libp2p.io/posts.svg)](https://discuss.libp2p.io)

> Noise libp2p handshake for js-libp2p

This repository contains TypeScript implementation of noise protocol, an encryption protocol used in libp2p.

##### Warning: Even though this package works in browser, it will bundle around 1.5Mb of code 

## Usage

Install with `yarn add libp2p-noise` or `npm i libp2p-noise`.

Example of using default noise configuration and passing it to the libp2p config:

```js
import {NOISE, Noise} from "libp2p-noise"


//custom noise configuration, pass it instead of NOISE instance
const noise = new Noise(privateKey, Buffer.alloc(x));

const libp2p = new Libp2p({
   modules: {
     connEncryption: [NOISE],
   },
});
```

Where parameters for Noise constructor are:
 - *static Noise key* - (optional) existing private Noise static key
 - *early data* - (optional) an early data payload to be sent in handshake messages
 


## API

This module exposes a crypto interface, as defined in the repository [js-interfaces](https://github.com/libp2p/js-interfaces).

[» API Docs](https://github.com/libp2p/js-interfaces/tree/master/src/crypto#api)


## Contribute

Feel free to join in. All welcome. Open an issue!

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

[MIT](LICENSE)
