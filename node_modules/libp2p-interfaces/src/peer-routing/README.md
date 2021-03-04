interface-peer-routing
=====================

**WIP: This module is not yet implemented**

> A test suite and interface you can use to implement a Peer Routing module for libp2p.

The primary goal of this module is to enable developers to pick and swap their Peer Routing module as they see fit for their libp2p installation, without having to go through shims or compatibility issues. This module and test suite were heavily inspired by abstract-blob-store and interface-stream-muxer.

Publishing a test suite as a module lets multiple modules all ensure compatibility since they use the same test suite.

# Modules that implement the interface

- [JavaScript libp2p-kad-dht](https://github.com/libp2p/js-libp2p-kad-dht)
- [JavaScript libp2p-delegated-peer-routing](https://github.com/libp2p/js-libp2p-delegated-peer-routing)

# Badge

Include this badge in your readme if you make a module that is compatible with the interface-record-store API. You can validate this by running the tests.

![](https://raw.githubusercontent.com/libp2p/interface-peer-routing/master/img/badge.png)

# How to use the battery of tests

## Node.js

TBD

# API

A valid (read: that follows this abstraction) Peer Routing module must implement the following API.

### findPeer

- `findPeer(peerId)`

Query the network for all multiaddresses associated with a `PeerId`.

**Parameters**
- [peerId](https://github.com/libp2p/js-peer-id).

**Returns**

It returns the [peerId](https://github.com/libp2p/js-peer-id) together with the known peers [multiaddrs](https://github.com/multiformats/js-multiaddr), as follows:

`Promise<{ id: PeerId, multiaddrs: Multiaddr[] }>`
