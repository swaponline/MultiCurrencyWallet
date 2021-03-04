# js-multistream-select

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](https://protocol.ai)
[![](https://img.shields.io/badge/project-multiformats-blue.svg?style=flat-square)](https://github.com/multiformats/multiformats)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](https://webchat.freenode.net/?channels=%23ipfs)
[![](https://img.shields.io/codecov/c/github/multiformats/js-multistream-select.svg?style=flat-square)](https://codecov.io/gh/multiformats/js-multistream-select)
[![](https://img.shields.io/travis/multiformats/js-multistream-select.svg?style=flat-square)](https://travis-ci.com/multiformats/js-multistream-select)
[![Dependency Status](https://david-dm.org/multiformats/js-multistream-select.svg?style=flat-square)](https://david-dm.org/multiformats/js-multistream-select)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> JavaScript implementation of [multistream-select](https://github.com/multiformats/multistream-select)

## Lead Maintainer

[Jacob Heun](https://github.com/jacobheun)

## Table of Contents

- [Background](#background)
  - [What is multistream-select?](#what-is-multistream-select)
    - [Select a protocol flow](#select-a-protocol-flow)
- [Install](#install)
- [Usage](#usage)
    - [Dialer](#dialer)
    - [Listener](#listener)
- [API](#api)
- [Maintainers](#maintainers)
- [Contribute](#contribute)
- [License](#license)

## Background

### What is `multistream-select`?

TLDR; multistream-select is protocol multiplexing per connection/stream. [Full spec here](https://github.com/multiformats/multistream-select)

#### Select a protocol flow

The caller will send "interactive" messages, expecting for some acknowledgement from the callee, which will "select" the handler for the desired and supported protocol:

```console
< /multistream-select/0.3.0  # i speak multistream-select/0.3.0
> /multistream-select/0.3.0  # ok, let's speak multistream-select/0.3.0
> /ipfs-dht/0.2.3            # i want to speak ipfs-dht/0.2.3
< na                         # ipfs-dht/0.2.3 is not available
> /ipfs-dht/0.1.9            # What about ipfs-dht/0.1.9 ?
< /ipfs-dht/0.1.9            # ok let's speak ipfs-dht/0.1.9 -- in a sense acts as an ACK
> <dht-message>
> <dht-message>
> <dht-message>
```

This mode also packs a `ls` option, so that the callee can list the protocols it currently supports

## Install

```sh
npm i multistream-select
```

## Usage

```js
const MSS = require('multistream-select')
// You can now use
// MSS.Dialer - actively select a protocol with a remote
// MSS.Listener - handle a protocol with a remote
```

### Dialer

```js
const pipe = require('it-pipe')
const MSS = require('multistream-select')
const Mplex = require('libp2p-mplex')

const muxer = new Mplex()
const muxedStream = muxer.newStream()

const mss = new MSS.Dialer(muxedStream)

// mss.select(protocol(s))
// Select from one of the passed protocols (in priority order)
// Returns selected stream and protocol
const { stream: dhtStream, protocol } = await mss.select([
  // This might just be different versions of DHT, but could be different impls
  '/ipfs-dht/2.0.0', // Most of the time this will probably just be one item.
  '/ipfs-dht/1.0.0'
])

// Typically this stream will be passed back to the caller of libp2p.dialProtocol
//
// ...it might then do something like this:
// try {
//   await pipe(
//     [uint8ArrayFromString('Some DHT data')]
//     dhtStream,
//     async source => {
//       for await (const chunk of source)
//         // DHT response data
//     }
//   )
// } catch (err) {
//   // Error in stream
// }
```

### Listener

```js
const pipe = require('it-pipe')
const MSS = require('multistream-select')
const Mplex = require('libp2p-mplex')

const muxer = new Mplex({
  async onStream (muxedStream) {
    const mss = new MSS.Listener(muxedStream)

    // mss.handle(handledProtocols)
    // Returns selected stream and protocol
    const { stream, protocol } = await mss.handle([
      '/ipfs-dht/1.0.0',
      '/ipfs-bitswap/1.0.0'
    ])

    // Typically here we'd call the handler function that was registered in
    // libp2p for the given protocol:
    // e.g. handlers[protocol].handler(stream)
    //
    // If protocol was /ipfs-dht/1.0.0 it might do something like this:
    // try {
    //   await pipe(
    //     dhtStream,
    //     source => (async function * () {
    //       for await (const chunk of source)
    //         // Incoming DHT data -> process and yield to respond
    //     })(),
    //     dhtStream
    //   )
    // } catch (err) {
    //   // Error in stream
    // }
  }
})
```

## API

### `new MSS.Dialer(duplex)`

Create a new multistream select "dialer" instance which can be used to negotiate a protocol to use, list all available protocols the remote supports, or do both.

#### Parameters

* `duplex` (`Object`) - A [duplex iterable stream](https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9#duplex-it) to dial on.

#### Returns

A new multistream select dialer instance.

#### Examples

```js
const dialer = new MSS.Dialer(duplex)
```

### `dialer.select(protocols)`

Negotiate a protocol to use from a list of protocols.

#### Parameters

* `protocols` (`String[]`/`String`) - A list of protocols (or single protocol) to negotiate with. Protocols are attempted in order until a match is made.

#### Returns

`Promise<{ stream<Object>, protocol<String> }>` - A stream for the selected protocol and the protocol that was selected from the list of protocols provided to `select`.

Note that after a protocol is selected `dialer` can no longer be used.

#### Examples

```js
const { stream, protocol } = await dialer.select([
  // This might just be different versions of DHT, but could be different impls
  '/ipfs-dht/2.0.0', // Most of the time this will probably just be one item.
  '/ipfs-dht/1.0.0'
])
// Now talk `protocol` on `stream`
```

### `dialer.ls()`

List protocols that the remote supports.

#### Returns

`String[]` - A list of all the protocols the remote supports.

#### Examples

```js
const protocols = await dialer.ls()
const wantedProto = '/ipfs-dht/2.0.0'

if (!protocols.includes(wantedProto)) {
  throw new Error('remote does not support ' + wantedProto)
}

// Now use dialer.select to use wantedProto, safe in the knowledge it is supported
```

### `new MSS.Listener(duplex)`

Construct a new multistream select "listener" instance which can be used to handle multistream protocol selections for particular protocols.

#### Parameters

* `duplex` (`Object`) - A [duplex iterable stream](https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9#duplex-it) to listen on.

#### Returns

A new multistream select listener instance.

#### Examples

```js
const listener = new MSS.Listener(duplex)
```

### `listener.handle(protocols)`

Handle multistream protocol selections for the given list of protocols.

#### Parameters

* `protocols` (`String[]`/`String`) - A list of protocols (or single protocol) that this listener is able to speak.

#### Returns

`Promise<{ stream<Object>, protocol<String> }>` - A stream for the selected protocol and the protocol that was selected from the list of protocols provided to `select`.

Note that after a protocol is handled `listener` can no longer be used.

#### Examples

```js
const { stream, protocol } = await listener.handle([
  '/ipfs-dht/1.0.0',
  '/ipfs-bitswap/1.0.0'
])
// Remote wants to speak `protocol`
```

## Contribute

Contributions welcome. Please check out [the issues](https://github.com/multiformats/js-multistream-select/issues).

Check out our [contributing document](https://github.com/multiformats/multiformats/blob/master/contributing.md) for more information on how we work, and about contributing in general. Please be aware that all interactions related to multiformats are subject to the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

[MIT](LICENSE)
