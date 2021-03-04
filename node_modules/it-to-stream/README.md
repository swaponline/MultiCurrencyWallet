# it-to-stream

[![Build Status](https://travis-ci.org/alanshaw/it-to-stream.svg?branch=master)](https://travis-ci.org/alanshaw/it-to-stream)
[![dependencies Status](https://david-dm.org/alanshaw/it-to-stream/status.svg)](https://david-dm.org/alanshaw/it-to-stream)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

> Convert streaming iterables to Node.js streams

## Install

```sh
npm i it-to-stream
```

## Usage

```js
const toStream = require('it-to-stream')
```

### Convert source iterable to readable stream

```js
// A streaming iterable "source" is just an (async) iterable
const source = (async function * () {
  for (const value of [1, 2, 3, 4]) yield Buffer.from(value.toString())
})()

const readable = toStream.readable(source)

// Now we have a readable stream, we can consume it by
readable.on('data', console.log)
// or
readable.pipe(writable)
// or
pipeline(readable, writable, err => console.log(err || 'done'))
```

### Convert sink iterable to writable stream

```js
// A streaming iterable "sink" is an (async) function that takes a "source"
// and consumes it.
const sink = async source => {
  for await (const chunk of source) {
    console.log(chunk.toString())
  }
}

const writable = toStream.writable(sink)

// Now we have a writable stream, we can pipe to it
fs.createReadStream('/path/to/file').pipe(writable)
```

### Convert transform iterable to transform stream

```js
// A streaming iterable "transform" is a function that takes a "source" and
// returns a "source".
const transform = source => (async function * () {
  for await (const chunk of source) {
    // Replace all space characters with dashes
    yield Buffer.from(chunk.toString().replace(/ /g, '-'))
  }
})()

const transform = toStream.transform(transform)

// Now we have a transform stream, we can pipe to and from it
fs.createReadStream('/path/to/file')
  .pipe(transform)
  .pipe(fs.createWriteStream('/path/to/file2'))
```

## API

```js
const toStream = require('it-to-stream')
```

### `toStream.readable(source, [options]): Readable`

Convert a [source](https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9#source-it) iterable to a [`Readable`](https://nodejs.org/dist/latest/docs/api/stream.html#stream_readable_streams) stream.

`options` are passed directly to the `Readable` constructor.

### `toStream.writable(sink, [options]): Writable`

Convert a [sink](https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9#sink-it) iterable to a [`Writable`](https://nodejs.org/dist/latest/docs/api/stream.html#stream_writable_streams) stream.

`options` are passed directly to the `Writable` constructor.

### `toStream.transform(transform, [options]): Transform`

Convert a [transform](https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9#transform-it) iterable to a [`Transform`](https://nodejs.org/dist/latest/docs/api/stream.html#stream_duplex_and_transform_streams) stream.

`options` are passed directly to the `Transform` constructor.

### `toStream.duplex(duplex, [options]): Duplex`

Convert a [duplex](https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9#duplex-it) iterable to a [`Duplex`](https://nodejs.org/dist/latest/docs/api/stream.html#stream_duplex_and_transform_streams) stream.

`options` are passed directly to the `Duplex` constructor.

## Related

* [`stream-to-it`](https://www.npmjs.com/package/stream-to-it) Convert Node.js streams to streaming iterables
* [`it-pipe`](https://www.npmjs.com/package/it-pipe) Utility to "pipe" async iterables together

## Contribute

Feel free to dive in! [Open an issue](https://github.com/alanshaw/it-to-stream/issues/new) or submit PRs.

## License

[MIT](LICENSE) © Alan Shaw
