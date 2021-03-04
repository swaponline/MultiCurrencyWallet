interface-peer-discovery
========================

> A test suite and interface you can use to implement a Peer Discovery module for libp2p.

The primary goal of this module is to enable developers to pick and/or swap their Peer Discovery modules as they see fit for their application, without having to go through shims or compatibility issues. This module and test suite was heavily inspired by [abstract-blob-store](https://github.com/maxogden/abstract-blob-store).

Publishing a test suite as a module lets multiple modules all ensure compatibility since they use the same test suite.

The API is presented with both Node.js and Go primitives, however, there is not actual limitations for it to be extended for any other language, pushing forward the cross compatibility and interop through diferent stacks.

## Modules that implement the interface

- [JavaScript libp2p-mdns](https://github.com/libp2p/js-libp2p-mdns)
- [JavaScript libp2p-bootstrap](https://github.com/libp2p/js-libp2p-bootstrap)
- [JavaScript libp2p-kad-dht](https://github.com/libp2p/js-libp2p-kad-dht)
- [JavaScript libp2p-webrtc-star](https://github.com/libp2p/js-libp2p-webrtc-star)
- [JavaScript libp2p-websocket-star](https://github.com/libp2p/js-libp2p-websocket-star)
- [TypeScript discv5](https://github.com/chainsafe/discv5)

Send a PR to add a new one if you happen to find or write one.

## Badge

Include this badge in your readme if you make a new module that uses interface-peer-discovery API.

![](/img/badge.png)

## Usage

### Node.js

Install `interface-discovery` as one of the dependencies of your project and as a test file. Then, using `mocha` (for JavaScript) or a test runner with compatible API, do:

```js
const tests = require('libp2p-interfaces/src/peer-discovery/tests')

describe('your discovery', () => {
  // use all of the test suits
  tests({
    setup () {
      return YourDiscovery
    },
    teardown () {
      // Clean up any resources created by setup()
    }
  })
})
```

## API

A valid (read: that follows this abstraction) Peer Discovery module must implement the following API:

### `start` the service

- `await discovery.start()`

Start the discovery service.

It returns a `Promise`

### `stop` the service

- `await discovery.stop()`

Stop the discovery service.

It returns a `Promise`

### discoverying peers

- `discovery.on('peer', (peerData) => {})`

Every time a peer is discovered by a discovery service, it emits a `peer` event with the discovered peer's information, which must contain the following properties:

- `<`[`PeerId`](https://github.com/libp2p/js-peer-id)`>` `peerData.id`
- `<Array<`[`Multiaddr`](https://github.com/multiformats/js-multiaddr)`>>` `peerData.multiaddrs`
