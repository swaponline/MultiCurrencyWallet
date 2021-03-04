# peer-id

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://protocol.ai)
[![](https://img.shields.io/badge/project-libp2p-yellow.svg?style=flat-square)](http://libp2p.io/)
[![](https://img.shields.io/badge/freenode-%23libp2p-yellow.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23libp2p)
[![Discourse posts](https://img.shields.io/discourse/https/discuss.libp2p.io/posts.svg)](https://discuss.libp2p.io)
[![](https://img.shields.io/codecov/c/github/libp2p/js-peer-id.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-peer-id)
[![](https://img.shields.io/travis/libp2p/js-peer-id.svg?style=flat-square)](https://travis-ci.com/libp2p/js-peer-id)
[![Dependency Status](https://david-dm.org/libp2p/js-peer-id.svg?style=flat-square)](https://david-dm.org/libp2p/js-peer-id)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> [IPFS](https://github.com/ipfs/ipfs) Peer ID implementation in JavaScript.

## Lead Maintainer

[Vasco Santos](https://github.com/vasco-santos)

## Table of Contents

- [peer-id](#peer-id)
  - [Lead Maintainer](#lead-maintainer)
  - [Table of Contents](#table-of-contents)
- [Description](#description)
- [Example](#example)
- [Installation](#installation)
  - [npm](#npm)
- [Setup](#setup)
  - [Node.js](#nodejs)
  - [Browser: Browserify, Webpack, other bundlers](#browser-browserify-webpack-other-bundlers)
  - [Browser: `<script>` Tag](#browser-script-tag)
- [CLI](#cli)
- [API](#api)
  - [Create](#create)
    - [`new PeerId(id[, privKey, pubKey])`](#new-peeridid-privkey-pubkey)
    - [`create([opts])`](#createopts)
  - [Import](#import)
    - [`createFromHexString(str)`](#createfromhexstringstr)
    - [`createFromBytes(buf)`](#createfrombytesbuf)
    - [`createFromCID(cid)`](#createfromcidcid)
    - [`createFromB58String(str)`](#createfromb58stringstr)
    - [`createFromPubKey(pubKey)`](#createfrompubkeypubkey)
    - [`createFromPrivKey(privKey)`](#createfromprivkeyprivkey)
    - [`createFromJSON(obj)`](#createfromjsonobj)
    - [`createFromProtobuf(buf)`](#createfromprotobufbuf)
  - [Export](#export)
    - [`toHexString()`](#tohexstring)
    - [`toBytes()`](#tobytes)
    - [`toString()`](#tostring)
    - [`toB58String()`](#tob58string)
    - [`toJSON()`](#tojson)
    - [`marshal(excludePrivateKey)`](#marshalexcludeprivatekey)
    - [`marshalPubKey()`](#marshalpubkey)
    - [`toPrint()`](#toprint)
    - [`equals(id)`](#equalsid)
    - [`isEqual(id)`](#isequalid)
  - [Others](#others)
    - [`isPeerId(id)`](#ispeeridid)
- [License](#license)

# Description

Generate, import, and export PeerIDs, for use with [IPFS](https://github.com/ipfs/ipfs).

A Peer ID is the SHA-256 [multihash](https://github.com/multiformats/multihash) of a public key.

The public key is a base64 encoded string of a protobuf containing an RSA DER buffer. This uses a node buffer to pass the base64 encoded public key protobuf to the multihash for ID generation.

# Example

```JavaScript
const PeerId = require('peer-id')

const id = await PeerId.create({ bits: 1024, keyType: 'RSA' })
console.log(JSON.stringify(id.toJSON(), null, 2))
```

```bash
{
  "id": "Qma9T5YraSnpRDZqRR4krcSJabThc8nwZuJV3LercPHufi",
  "privKey": "CAAS4AQwggJcAgEAAoGBAMBgbIqyOL26oV3nGPBYrdpbv..",
  "pubKey": "CAASogEwgZ8wDQYJKoZIhvcNAQEBBQADgY0AMIGJAoGBAMBgbIqyOL26oV3nGPBYrdpbvzCY..."
}
```

# Installation

## npm

```sh
> npm i peer-id
```

# Setup

## Node.js

```js
const PeerId = require('peer-id')
```

## Browser: Browserify, Webpack, other bundlers

The code published to npm that gets loaded on require is in fact a ES5
transpiled version with the right shims added. This means that you can require
it and use with your favourite bundler without having to adjust asset management
process.

```js
const PeerId = require('peer-id')
```

## Browser: `<script>` Tag

Loading this module through a script tag will make the `PeerId` obj available in
the global namespace.

```html
<script src="https://unpkg.com/peer-id/dist/index.min.js"></script>
<!-- OR -->
<script src="https://unpkg.com/peer-id/dist/index.js"></script>
```

# CLI

After installing `peer-id`, `npm install peer-id`, you can leverage the cli to generate keys exported as JSON. You can specify the type for the key and size, as detailed in [`create([opts])`](#createopts). The defaults are shown here.

```sh
> peer-id --type rsa --bits 2048
```

# API

```js
const PeerId = require('peer-id')
```

## Create

### `new PeerId(id[, privKey, pubKey])`

- `id: Buffer` - The multihash of the public key as `Buffer`
- `privKey: RsaPrivateKey` - The private key
- `pubKey: RsaPublicKey` - The public key

The key format is detailed in [libp2p-crypto](https://github.com/libp2p/js-libp2p-crypto).

### `create([opts])`

Generates a new Peer ID, complete with public/private keypair.

- `opts.bits: number` - The size of the key. Default: `2048`
- `opts.keyType: string` - The key type, one of: `['RSA', 'Ed25519', 'secp256k1']`. Default: `RSA`

Returns `Promise<PeerId>`.

## Import

### `createFromHexString(str)`

Creates a Peer ID from hex string representing the key's multihash.

Returns `PeerId`.

### `createFromBytes(buf)`

Creates a Peer ID from a buffer representing the key's multihash.

Returns `PeerId`.

### `createFromCID(cid)`

- `cid: CID|String|Buffer` - The multihash encoded as [CID](https://github.com/ipld/js-cid) (object, `String` or `Buffer`)

Creates a Peer ID from a CID representation of the key's multihash ([RFC 0001](https://github.com/libp2p/specs/blob/master/RFC/0001-text-peerid-cid.md)).

Returns `PeerId`.

### `createFromB58String(str)`

Creates a Peer ID from a Base58 string representing the key's multihash.

Returns `PeerId`.

### `createFromPubKey(pubKey)`

- `publicKey: Buffer`

Creates a Peer ID from a buffer containing a public key.

Returns `Promise<PeerId>`.

### `createFromPrivKey(privKey)`

- `privKey: Buffer`

Creates a Peer ID from a buffer containing a private key.

Returns `Promise<PeerId>`.

### `createFromJSON(obj)`

- `obj.id: String` - The multihash encoded in `base58`
- `obj.pubKey: String` - The public key in protobuf format, encoded in `base64`
- `obj.privKey: String` - The private key in protobuf format, encoded in `base64`

Returns `Promise<PeerId>`.

### `createFromProtobuf(buf)`

`buf` is a protocol-buffers encoded PeerId (see `marshal()`)

## Export

### `toHexString()`

Returns the Peer ID's `id` as a hex string.

```
1220d6243998f2fc56343ad7ed0342ab7886a4eb18d736f1b67d44b37fcc81e0f39f
```

### `toBytes()`

Returns the Peer ID's `id` as a buffer.

```
<Buffer 12 20 d6 24 39 98 f2 fc 56 34 3a d7 ed 03 42 ab 78 86 a4 eb 18 d7 36 f1 b6 7d 44 b3 7f cc 81 e0 f3 9f>
```


### `toString()`

Returns the Peer ID's `id` as a self-describing CIDv1 in Base32 ([RFC 0001](https://github.com/libp2p/specs/blob/master/RFC/0001-text-peerid-cid.md))

```
bafzbeigweq4zr4x4ky2dvv7nanbkw6egutvrrvzw6g3h2rftp7gidyhtt4
```

### `toB58String()`

Returns the Peer ID's `id` as a base58 string (multihash/CIDv0).

```
QmckZzdVd72h9QUFuJJpQqhsZqGLwjhh81qSvZ9BhB2FQi
```

### `toJSON()`

Returns an `obj` of the form

- `obj.id: String` - The multihash encoded in `base58`
- `obj.pubKey: String` - The public key in protobuf format, encoded in 'base64'
- `obj.privKey: String` - The private key in protobuf format, encoded in 'base 64'

### `marshal(excludePrivateKey)`

Returns a protocol-buffers encoded version of the id, public key and, if `excludePrivateKey` is not set, the private key.

### `marshalPubKey()`

Returns a protobuf of just the public key, compatible with `libp2p-crypto` (unlike `marshal` above).

For example:
```js
const crypto = require('libp2p-crypto')

PeerId.create({ bits: 256, keyType: 'ed25519' }).then( pid => {
  let pk = crypto.keys.unmarshalPublicKey(pid.marshalPubKey())
  // your code here
}
```

### `toPrint()`

Returns the Peer ID as a printable string without the `Qm` prefix.

Example: `<peer.ID xxxxxx>`

### `equals(id)`

Returns `true` if the given PeerId is equal to the current instance.

- `id` can be a PeerId or a Buffer containing the id

### `isEqual(id)`
**Deprecation Notice**: Use [`equals`](#equalsid), `isEqual` will be removed in 0.14.0.

- `id` can be a PeerId or a Buffer containing the id

## Others

### `isPeerId(id)`

Returns `true` if the given id is an instance of PeerId

- `id` should be an instance of PeerId

# License

MIT
