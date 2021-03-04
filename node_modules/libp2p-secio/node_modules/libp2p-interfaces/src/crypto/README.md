interface-crypto
==================

> A test suite you can use to implement a libp2p crypto module. A libp2p crypto module is used to ensure all exchanged data between two peers is encrypted.

**Modules that implement the interface**

- [js-libp2p-secio](https://github.com/libp2p/js-libp2p-secio)

## Table of Contents
- [interface-crypto](#interface-crypto)
  - [Table of Contents](#table-of-contents)
  - [Using the Test Suite](#using-the-test-suite)
  - [API](#api)
    - [Secure Inbound](#secure-inbound)
    - [Secure Outbound](#secure-outbound)
  - [Crypto Errors](#crypto-errors)
    - [Error Types](#error-types)

## Using the Test Suite

You can also check out the [internal test suite](../../test/crypto/compliance.spec.js) to see the setup in action.

```js
const tests = require('libp2p-interfaces/src/crypto/tests')
const yourCrypto = require('./your-crypto')

tests({
  setup () {
    // Set up your crypto if needed, then return it
    return yourCrypto
  },
  teardown () {
    // Clean up your crypto if needed
  }
})
```

## API

- `Crypto`
  - `protocol<string>`: The protocol id of the crypto module.
  - `secureInbound<function(PeerId, duplex)>`: Secures inbound connections.
  - `secureOutbound<function(PeerId, duplex, PeerId)>`: Secures outbound connections.

### Secure Inbound

- `const { conn, remotePeer } = await crypto.secureInbound(localPeer, duplex, [remotePeer])`

Secures an inbound [streaming iterable duplex][iterable-duplex] connection. It returns an encrypted [streaming iterable duplex][iterable-duplex], as well as the [PeerId][peer-id] of the remote peer.

**Parameters**
- `localPeer` is the [PeerId][peer-id] of the receiving peer.
- `duplex` is the [streaming iterable duplex][iterable-duplex] that will be encryption.
- `remotePeer` is the optional [PeerId][peer-id] of the initiating peer, if known. This may only exist during transport upgrades.

**Return Value**
- `<object>`
  - `conn<duplex>`: An encrypted [streaming iterable duplex][iterable-duplex].
  - `remotePeer<PeerId>`: The [PeerId][peer-id] of the remote peer.

### Secure Outbound

- `const { conn, remotePeer } = await crypto.secureOutbound(localPeer, duplex, remotePeer)`

Secures an outbound [streaming iterable duplex][iterable-duplex] connection. It returns an encrypted [streaming iterable duplex][iterable-duplex], as well as the [PeerId][peer-id] of the remote peer.

**Parameters**
- `localPeer` is the [PeerId][peer-id] of the receiving peer.
- `duplex` is the [streaming iterable duplex][iterable-duplex] that will be encrypted.
- `remotePeer` is the [PeerId][peer-id] of the remote peer. If provided, implementations **should** use this to validate the integrity of the remote peer.

**Return Value**
- `<object>`
  - `conn<duplex>`: An encrypted [streaming iterable duplex][iterable-duplex].
  - `remotePeer<PeerId>`: The [PeerId][peer-id] of the remote peer. This **should** match the `remotePeer` parameter, and implementations should enforce this.

[peer-id]: https://github.com/libp2p/js-peer-id
[iterable-duplex]: https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9#duplex-it

## Crypto Errors

Common crypto errors come with the interface, and can be imported directly. All Errors take an optional message.

```js
const {
  InvalidCryptoExchangeError,
  InvalidCryptoTransmissionError,
  UnexpectedPeerError
} = require('libp2p-interfaces/src/crypto/errors')

const error = new UnexpectedPeerError('a custom error message')
console.log(error.code === UnexpectedPeerError.code) // true
```

### Error Types

- `InvalidCryptoExchangeError` - Should be thrown when a peer provides data that is insufficient to finish the crypto exchange.
- `InvalidCryptoTransmissionError` - Should be thrown when an error occurs during encryption/decryption.
- `UnexpectedPeerError` - Should be thrown when the expected peer id does not match the peer id determined via the crypto exchange.
