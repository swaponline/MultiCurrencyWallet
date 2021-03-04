# interface-stream-muxer

> A test suite and interface you can use to implement a stream muxer. "A one stop shop for all your muxing needs"

The primary goal of this module is to enable developers to pick and swap their stream muxing module as they see fit for their application, without having to go through shims or compatibility issues. This module and test suite was heavily inspired by [abstract-blob-store](https://github.com/maxogden/abstract-blob-store).

Publishing a test suite as a module lets multiple modules all ensure compatibility since they use the same test suite.

The API is presented with both Node.js and Go primitives, however, there is no actual limitations for it to be extended for any other language, pushing forward the cross compatibility and interop through different stacks.

## Modules that implement the interface

- [js-libp2p-spdy](https://github.com/libp2p/js-libp2p-spdy)
- [js-libp2p-mplex](https://github.com/libp2p/js-libp2p-mplex)

Send a PR to add a new one if you happen to find or write one.

## Badge

Include this badge in your readme if you make a new module that uses interface-stream-muxer API.

![](/img/badge.png)

## Usage

Install `interface-stream-muxer` as one of the dependencies of your project and as a test file. Then, using `mocha` (for JavaScript) or a test runner with compatible API, do:

```js
const test = require('libp2p-interfaces/src/stream-muxer/tests')

const common = {
  async setup () {
    return yourMuxer
  },
  async teardown () {
    // cleanup
  }
}

// use all of the test suits
test(common)
```

## API

A valid (one that follows this abstraction) stream muxer, must implement the following API:

### `const muxer = new Muxer([options])`

Create a new _duplex_ stream that can be piped together with a connection in order to allow multiplexed communications.

e.g.

```js
const Muxer = require('your-muxer-module')
const pipe = require('it-pipe')

// Create a duplex muxer
const muxer = new Muxer()

// Use the muxer in a pipeline
pipe(conn, muxer, conn) // conn is duplex connection to another peer
```

`options` is an optional `Object` that may have the following properties:

* `onStream` - A function called when receiving a new stream from the remote. e.g.
    ```js
    // Receive a new stream on the muxed connection
    const onStream = stream => {
      // Read from this stream and write back to it (echo server)
      pipe(
        stream,
        source => (async function * () {
          for await (const data of source) yield data
        })()
        stream
      )
    }
    const muxer = new Muxer({ onStream })
    // ...
    ```
    **Note:** The `onStream` function can be passed in place of the `options` object. i.e.
    ```js
    new Mplex(stream => { /* ... */ })
    ```
* `onStreamEnd` - A function called when a stream ends.
  ```js
     // Get notified when a stream has ended
    const onStreamEnd = stream => {
      // Manage any tracking changes, etc
    }
    const muxer = new Muxer({ onStreamEnd, ... })
  ```
* `signal` - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) which can be used to abort the muxer, _including_ all of it's multiplexed connections. e.g.
    ```js
    const controller = new AbortController()
    const muxer = new Muxer({ signal: controller.signal })

    pipe(conn, muxer, conn)

    controller.abort()
    ```
* `maxMsgSize` - The maximum size in bytes the data field of multiplexed messages may contain (default 1MB)

### `muxer.onStream`

Use this property as an alternative to passing `onStream` as an option to the `Muxer` constructor.

```js
const muxer = new Muxer()
// ...later
muxer.onStream = stream => { /* ... */ }
```

### `muxer.onStreamEnd`

Use this property as an alternative to passing `onStreamEnd` as an option to the `Muxer` constructor.

```js
const muxer = new Muxer()
// ...later
muxer.onStreamEnd = stream => { /* ... */ }
```

### `const stream = muxer.newStream([options])`

Initiate a new stream with the remote. Returns a [duplex stream](https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9#duplex-it).

e.g.

```js
// Create a new stream on the muxed connection
const stream = muxer.newStream()

// Use this new stream like any other duplex stream:
pipe([1, 2, 3], stream, consume)
```

### `const streams = muxer.streams`

The streams property returns an array of streams the muxer currently has open. Closed streams will not be returned.

```js
muxer.streams.map(stream => {
  // Log out the stream's id
  console.log(stream.id)
})
```
