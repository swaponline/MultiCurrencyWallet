# stream-to-it

[![Build Status](https://travis-ci.org/alanshaw/stream-to-it.svg?branch=master)](https://travis-ci.org/alanshaw/stream-to-it)
[![dependencies Status](https://david-dm.org/alanshaw/stream-to-it/status.svg)](https://david-dm.org/alanshaw/stream-to-it)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

> Convert Node.js streams to streaming iterables

## Install

```sh
npm i stream-to-it
```

## Usage

```js
const toIterable = require('stream-to-it')
```

### Convert readable stream to source iterable

```js
const readable = fs.createReadStream('/path/to/file')
// Node.js streams are already async iterable so this is just s => s
const source = toIterable.source(readable)

for await (const chunk of source) {
  console.log(chunk.toString())
}
```

Also works with browser [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream):

```js
const res = fetch('http://example.org/file.jpg')

for await (const chunk of toIterable.source(res.body)) {
  console.log(chunk.toString())
}
```

### Convert writable stream to sink iterable

```js
const pipe = require('it-pipe')

const source = [Buffer.from('Hello '), Buffer.from('World!')]
const sink = toIterable.sink(fs.createWriteStream('/path/to/file'))

await pipe(source, sink)
```

### Convert transform stream to transform iterable

```js
const { Transform } = require('stream')

const output = await pipe(
  [true, false, true, true],
  toIterable.transform(new Transform({ // Inverter transform :)
    transform (chunk, enc, cb) {
      cb(null, !chunk)
    }
  })),
  // Collect and return the chunks
  source => {
    const chunks = []
    for await (chunk of source) chunks.push(chunk)
    return chunks
  }
)

console.log(output) // [ false, true, false, false ]
```

## API

```js
const toIterable = require('stream-to-it')
```

### `toIterable.source(readable): Function`

Convert a [`Readable`](https://nodejs.org/dist/latest/docs/api/stream.html#stream_readable_streams) stream or a browser [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) to a [source](https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9#source-it) iterable.

### `toIterable.sink(writable): Function`

Convert a [`Writable`](https://nodejs.org/dist/latest/docs/api/stream.html#stream_writable_streams) stream to a [sink](https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9#sink-it) iterable.

### `toIterable.transform(transform): Function`

Convert a [`Transform`](https://nodejs.org/dist/latest/docs/api/stream.html#stream_duplex_and_transform_streams) stream to a [transform](https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9#transform-it) iterable.

### `toIterable.duplex(duplex): { sink: Function, source: Function }`

Convert a [`Duplex`](https://nodejs.org/dist/latest/docs/api/stream.html#stream_duplex_and_transform_streams) stream to a [duplex](https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9#duplex-it) iterable.

## Related

* [`it-to-stream`](https://www.npmjs.com/package/it-to-stream) Convert streaming iterables to Node.js streams
* [`it-pipe`](https://www.npmjs.com/package/it-pipe) Utility to "pipe" async iterables together

## Contribute

Feel free to dive in! [Open an issue](https://github.com/alanshaw/stream-to-it/issues/new) or submit PRs.

## License

[MIT](LICENSE) © Alan Shaw
