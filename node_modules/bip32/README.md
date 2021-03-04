# bip32
[![Build Status](https://travis-ci.org/bitcoinjs/bip32.png?branch=master)](https://travis-ci.org/bitcoinjs/bip32)

[![NPM](https://img.shields.io/npm/v/bip32.svg)](https://www.npmjs.org/package/bip32)

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

A [BIP32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki) compatible library written in TypeScript with transpiled JavaScript committed to git.


## Example

TypeScript

``` typescript
import * as bip32 from 'bip32';
import { BIP32Interface } from 'bip32';
let node: BIP32Interface = bip32.fromBase58('xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi');

let child: BIP32Interface = node.derivePath('m/0/0');
// ...
```

NodeJS

``` javascript
let bip32 = require('bip32')
let node = bip32.fromBase58('xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi')

let child = node.derivePath('m/0/0')
// ...
```

## LICENSE [MIT](LICENSE)
A derivation (and extraction for modularity) of the `HDWallet`/`HDNode` written and tested by [bitcoinjs-lib](https://github.com/bitcoinjs/bitcoinjs-lib) contributors since 2014.
