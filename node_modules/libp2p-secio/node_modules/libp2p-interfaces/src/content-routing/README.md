interface-content-routing
=====================

**WIP: This module is not yet implemented**

> A test suite and interface you can use to implement a Content Routing module for libp2p.

The primary goal of this module is to enable developers to pick and swap their Content Routing module as they see fit for their libp2p installation, without having to go through shims or compatibility issues. This module and test suite were heavily inspired by abstract-blob-store and interface-stream-muxer.

Publishing a test suite as a module lets multiple modules all ensure compatibility since they use the same test suite.

# Modules that implement the interface

- [JavaScript libp2p-kad-dht](https://github.com/libp2p/js-libp2p-kad-dht)
- [JavaScript libp2p-delegated-content-routing](https://github.com/libp2p/js-libp2p-delegated-content-routing)

# Badge

Include this badge in your readme if you make a module that is compatible with the interface-content-routing API. You can validate this by running the tests.

![](https://raw.githubusercontent.com/libp2p/interface-content-routing/master/img/badge.png)

# How to use the battery of tests

## Node.js

TBD

# API

A valid (read: that follows this abstraction) Content Routing module must implement the following API.

### findProviders

- `findProviders(cid)`

Find peers in the network that can provide a specific value, given a key.

**Parameters**
- [CID](https://github.com/multiformats/js-cid)

**Returns**

It returns an `AsyncIterable` containing the identification and addresses of the peers providing the given key, as follows:

`AsyncIterable<{ id: PeerId, multiaddrs: Multiaddr[] }>`

### provide

- `provide(cid)`

Announce to the network that we are providing the given value.

**Parameters**
- [CID](https://github.com/multiformats/js-cid)

**Returns**

It returns a promise that is resolved on the success of the operation.

`Promise<void>`
