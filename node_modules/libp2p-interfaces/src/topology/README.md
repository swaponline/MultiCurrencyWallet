interface-topology
========================

> Implementation of the topology interface used by the `js-libp2p` registrar.

Topologies can be used in conjunction with `js-libp2p` to help shape its network and the overlays of its subsystems, such as pubsub and the DHT.

## Table of Contents

- [Implementations](#implementations)
- [Install](#install)
- [Modules using the interface](#modulesUsingTheInterface)
- [Usage](#usage)
- [Api](#api)

## Implementations

### Topology

A libp2p topology with a group of common peers.

### Multicodec Topology

A libp2p topology with a group of peers that support the same protocol.

## Install

```sh
$ npm install libp2p-interfaces
```

## Modules using the interface

TBA

## Usage

###  Topology

```js
const Topology = require('libp2p-interfaces/src/topology')

const toplogy = new Topology({
  min: 0,
  max: 50
})
```

### Multicodec Topology

```js
const MulticodecTopology = require('libp2p-interfaces/src/topology/multicodec-topology')

const toplogy = new MulticodecTopology({
  min: 0,
  max: 50,
  multicodecs: ['/echo/1.0.0'],
  handlers: {
    onConnect: (peerId, conn) => {},
    onDisconnect: (peerId) => {}
  }
})
```

## API

The `MulticodecTopology` extends the `Topology`, which makes the `Topology` API a subset of the `MulticodecTopology` API.

###  Topology

- `Topology`
  - `peers<Map<string, PeerId>>`: A Map of peers belonging to the topology.
  - `disconnect<function(PeerId)>`: Called when a peer has been disconnected

#### Constructor

```js
const toplogy = new Topology({
  min: 0,
  max: 50,
  handlers: {
    onConnect: (peerId, conn) => {},
    onDisconnect: (peerId) => {}
  }
})
```

**Parameters**
- `properties` is an `Object` containing the properties of the topology.
  - `min` is a `number` with the minimum needed connections (default: 0)
  - `max` is a `number` with the maximum needed connections (default: Infinity)
  - `handlers` is an optional `Object` containing the handler called when a peer is connected or disconnected.
    - `onConnect` is a `function` called everytime a peer is connected in the topology context.
    - `onDisconnect` is a `function` called everytime a peer is disconnected in the topology context.

#### Set a peer

- `topology.peers.set(id, peerId)`

Add a peer to the topology.

**Parameters**
- `id` is the `string` that identifies the peer to add.
- `peerId` is the [PeerId][peer-id] of the peer to add.

#### Notify about a peer disconnected event

- `topology.disconnect(peerId)`

**Parameters**
- `peerId` is the [PeerId][peer-id] of the peer disconnected.

###  Multicodec Topology

- `MulticodecTopology`
  - `registrar<Registrar>`: The `Registrar` of the topology. This is set by the `Registrar` during registration.
  - `peers<Map<string, PeerId>>`: The Map of peers that belong to the topology
  - `disconnect<function(PeerId)>`: Disconnects a peer from the topology.

#### Constructor

```js
const toplogy = new MulticodecTopology({
  min: 0,
  max: 50,
  multicodecs: ['/echo/1.0.0'],
  handlers: {
    onConnect: (peerId, conn) => {},
    onDisconnect: (peerId) => {}
  }
})
```

**Parameters**
- `properties` is an `Object` containing the properties of the topology.
  - `min` is a `number` with the minimum needed connections (default: 0)
  - `max` is a `number` with the maximum needed connections (default: Infinity)
  - `multicodecs` is a `Array<String>` with the multicodecs associated with the topology.
  - `handlers` is an optional `Object` containing the handler called when a peer is connected or disconnected.
    - `onConnect` is a `function` called everytime a peer is connected in the topology context.
    - `onDisconnect` is a `function` called everytime a peer is disconnected in the topology context.

[peer-id]: https://github.com/libp2p/js-peer-id
