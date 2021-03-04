# js-libp2p-webrtc-star

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://protocol.ai)
[![](https://img.shields.io/badge/project-libp2p-yellow.svg?style=flat-square)](http://libp2p.io/)
[![](https://img.shields.io/badge/freenode-%23libp2p-yellow.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23libp2p)
[![Discourse posts](https://img.shields.io/discourse/https/discuss.libp2p.io/posts.svg)](https://discuss.libp2p.io)
[![](https://img.shields.io/codecov/c/github/libp2p/js-libp2p-webrtc-star.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-webrtc-star)
[![](https://img.shields.io/travis/libp2p/js-libp2p-webrtc-star.svg?style=flat-square)](https://travis-ci.com/libp2p/js-libp2p-webrtc-star)
[![Dependency Status](https://david-dm.org/libp2p/js-libp2p-webrtc-star.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-webrtc-star) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

[![](https://github.com/libp2p/js-libp2p-interfaces/raw/master/src/transport/img/badge.png)](https://github.com/libp2p/js-libp2p-interfaces/tree/master/src/transport)
[![](https://github.com/libp2p/js-libp2p-interfaces/raw/master/src/connection/img/badge.png)](https://github.com/libp2p/js-libp2p-interfaces/tree/master/src/connection)
[![](https://github.com/libp2p/js-libp2p-interfaces/raw/master/src/peer-discovery/img/badge.png)](https://github.com/libp2p/js-libp2p-interfaces/tree/master/src/peer-discovery)

> libp2p WebRTC transport that includes a discovery mechanism provided by the signalling-star

## Lead Maintainer

[Vasco Santos](https://github.com/vasco-santos).

## Description

`libp2p-webrtc-star` is one of the WebRTC transports available for libp2p. `libp2p-webrtc-star` incorporates both a transport and a discovery service that is facilitated by the signalling server, also part of this module.

## Usage

### Install

```bash
> npm install libp2p-webrtc-star
```

## Usage

### Using this module in Node.js (read: not in the browser)

To use this module in Node.js, you have to BYOI of WebRTC, there are multiple options out there, unfortunately, none of them are 100% solid. The ones we recommend are: [wrtc](http://npmjs.org/wrtc) and [electron-webrtc](https://www.npmjs.com/package/electron-webrtc).

Instead of just creating the WebRTCStar instance without arguments, you need to pass an options object with the WebRTC implementation:

```JavaScript
const wrtc = require('wrtc')
const electronWebRTC = require('electron-webrtc')
const WStar = require('libp2p-webrtc-star')

// Using wrtc
const ws1 = new WStar({ wrtc: wrtc })

// Using electron-webrtc
const ws2 = new WStar({ wrtc: electronWebRTC() })
```

### Using this module in the Browser

```JavaScript
const WStar = require('libp2p-webrtc-star')
const multiaddr = require('multiaddr')
const pipe = require('it-pipe')
const { collect } = require('streaming-iterables')

const addr = multiaddr('/ip4/188.166.203.82/tcp/20000/wss/p2p-webrtc-star/p2p/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSooo2a')

const ws = new WStar({ upgrader })

const listener = ws.createListener((socket) => {
  console.log('new connection opened')
  pipe(
    ['hello'],
    socket
  )
})

await listener.listen(addr)
console.log('listening')

const socket = await ws.dial(addr)
const values = await pipe(
  socket,
  collect
)

console.log(`Value: ${values.toString()}`)

// Close connection after reading
await listener.close()
```

## API

### Transport

[![](https://github.com/libp2p/js-libp2p-interfaces/raw/master/src/transport/img/badge.png)](https://github.com/libp2p/js-libp2p-interfaces/tree/master/src/transport)

### Connection

[![](https://github.com/libp2p/js-libp2p-interfaces/raw/master/src/connection/img/badge.png)](https://github.com/libp2p/js-libp2p-interfaces/tree/master/src/connection)

### Peer Discovery - `ws.discovery`

[![](https://github.com/libp2p/js-libp2p-interfaces/raw/master/src/peer-discovery/img/badge.png)](https://github.com/libp2p/js-libp2p-interfaces/tree/master/src/peer-discovery)

## Rendezvous server (aka Signaling server)

Nodes using `libp2p-webrtc-star` will connect to a known point in the network, a rendezvous point where they can learn about other nodes (Discovery) and exchange their [SDP offers (signaling data)](https://www.html5rocks.com/en/tutorials/webrtc/infrastructure/).

`libp2p-webrtc-star` comes with its own signaling server, used for peers to handshake their signaling data and establish a connection. You can install it in your machine by installing the module globally:

```bash
> npm install --global libp2p-webrtc-star
```

This will expose a `webrtc-star` cli tool. To spawn a server do:

```bash
> star-signal --port=13579 --host=127.0.0.1
```

Defaults:

- `port` - 9090
- `host` - '0.0.0.0'

## Hosted Rendezvous Server

We host signaling servers at `wrtc-star1.par.dwebops.pub` and `wrtc-star2.sjc.dwebops.pub`, that can be used for practical demos and experimentation, it **should not be used for apps in production**. Check [Deployment.md](./DEPLOYMENT.md) for how to deploy your own server.

A libp2p-webrtc-star address, using the signaling server we provide, looks like: 

`/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/p2p/<your-peer-id>`

Note: The address above indicates WebSockets Secure, which can be accessed from both http and https.
