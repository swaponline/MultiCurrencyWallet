js-mafmt
========

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://protocol.ai)
[![](https://img.shields.io/badge/project-multiformats-blue.svg?style=flat-square)](https://github.com/multiformats/multiformats)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](https://webchat.freenode.net/?channels=%23ipfs)
[![Dependency Status](https://david-dm.org/multiformats/js-mafmt.svg?style=flat-square)](https://david-dm.org/multiformats/js-mafmt)
[![](https://img.shields.io/travis/multiformats/js-mafmt.svg?style=flat-square)](https://travis-ci.com/multiformats/js-mafmt)
[![codecov](https://img.shields.io/codecov/c/github/multiformats/js-mafmt.svg?style=flat-square)](https://codecov.io/gh/multiformats/js-mafmt)

> Javascript implementation of multiaddr validation

## Lead Maintainer

[Vasco Santos](https://github.com/vasco-santos).

## Install

```sh
npm install mafmt
```

## Usage

```js
const mafmt = require('mafmt')

mafmt.DNS.matches('/dns4/ipfs.io') // true
```

## API

#### `mafmt.<FORMAT>.matches(multiaddr)`

Where `<FORMAT>` may be:

| `<FORMAT>` | Description | Example(s) |
| --- | --- | --- |
| `DNS` | a "dns4" or "dns6" format multiaddr | `/dnsaddr/ipfs.io`
| `DNS4` | a "dns4" format multiaddr | `/dns4/ipfs.io` |
| `DNS6` | a "dns6" format multiaddr | `/dns6/protocol.ai/tcp/80` |
| `IP` | an "ip4" or "ip6" format multiaddr | `/ip4/127.0.0.1` <br> `/ip6/fc00::` |
| `TCP` | a "tcp" over `IP` format multiaddr | `/ip4/0.0.7.6/tcp/1234` |
| `UDP` | a "udp" over `IP` format multiaddr | `/ip4/0.0.7.6/udp/1234` |
| `QUIC` | a "quic" over `UDP` format multiaddr | `/ip4/1.2.3.4/udp/1234/quic` |
| `UTP` | a "utp" over `UDP` format multiaddr | `/ip4/1.2.3.4/udp/3456/utp` |
| `Websockets` | a "ws" over `TCP` or "ws" over `DNS` format multiaddr | `/ip4/1.2.3.4/tcp/3456/ws` <br> `/dnsaddr/ipfs.io/ws` |
| `WebSocketsSecure` | a "wss" over `TCP` or "wss" over `DNS` format multiaddr | `/ip6/::/tcp/0/wss` <br> `/dnsaddr/ipfs.io/wss` |
| `HTTP` | a "http" over `TCP` or `DNS` or "http" over `DNS` format multiaddr | `/ip4/127.0.0.1/tcp/90/http` <br> `/dnsaddr/ipfs.io/http` |
| `HTTPS` | a "https" over `TCP` or `DNS` or "https" over `DNS` format multiaddr | `/ip4/127.0.0.1/tcp/90/https` <br> `/dnsaddr/ipfs.io/https` |
| `WebRTCStar` | a "p2p" over "p2p-webrtc-star" over `Websockets` or "p2p" over "p2p-webrtc-star" over `WebSocketsSecure` format multiaddr | `/dnsaddr/ipfs.io/wss/p2p-webrtc-star/p2p/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4` |
| `WebSocketStar` | a "p2p" over "p2p-websocket-star" over `Websockets` or "p2p" over "p2p-websocket-star" over `WebSocketsSecure` or "p2p-websocket-star" over `Websockets` or "p2p-websocket-star" over `WebSocketsSecure` format multiaddr | `/ip4/1.2.3.4/tcp/3456/ws/p2p-websocket-star` <br> `/dnsaddr/localhost/ws/p2p-websocket-star/p2p/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4` |
| `WebRTCDirect` | a "p2p-webrtc-direct" over `HTTP` or "p2p-webrtc-direct" over `HTTPS` format multiaddr | `/ip4/1.2.3.4/tcp/3456/http/p2p-webrtc-direct` |
| `Reliable` | a `WebSockets` or `WebSocketsSecure` or `HTTP` or `HTTPS` or `WebRTCStar` or `WebRTCDirect` or `TCP` or `UTP` or `QUIC` format multiaddr | `/dnsaddr/ipfs.io/wss` |
| `Circuit` |  | `/p2p/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4/p2p-circuit/p2p/QmUjNmr8TgJCn1Ao7DvMy4cjoZU15b9bwSCBLE3vwXiwgj` |
| `P2P` | "p2p", aka "ipfs", over `Reliable` or `WebRTCStar` or "p2p" format multiaddr | `/p2p/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4` <br> `/ip4/127.0.0.1/tcp/20008/ws/p2p/QmUjNmr8TgJCn1Ao7DvMy4cjoZU15b9bwSCBLE3vwXiwgj` |

Where `multiaddr` may be:

* a [Multiaddr](https://www.npmjs.com/package/multiaddr)
* a String
* a [Buffer](https://www.npmjs.com/package/buffer)

Returns `true`/`false`
