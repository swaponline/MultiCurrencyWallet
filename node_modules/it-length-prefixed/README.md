# it-length-prefixed

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
![Travis (.org)](https://img.shields.io/travis/alanshaw/it-length-prefixed.svg?style=flat-square)
![Codecov](https://img.shields.io/codecov/c/gh/alanshaw/it-length-prefixed.svg?style=flat-square)
[![Dependency Status](https://david-dm.org/alanshaw/it-length-prefixed.svg?style=flat-square)](https://david-dm.org/alanshaw/it-length-prefixed)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> Streaming length prefixed buffers with async iterators

## Install

```sh
npm install it-length-prefixed
```

## Usage

```js
const pipe = require('it-pipe')
const lp = require('it-length-prefixed')

const encoded = []

// encode
await pipe(
  [Buffer.from('hello world')],
  lp.encode(),
  async source => {
    for await (const chunk of source) {
      encoded.push(chunk.slice()) // (.slice converts BufferList to Buffer)
    }
  }
)

console.log(encoded)
// => [Buffer <0b 68 65 6c 6c 6f 20 77 6f 72 6c 64>]

const decoded = []

// decode
await pipe(
  encoded, // e.g. from above
  lp.decode(),
  async source => {
    for await (const chunk of source) {
      decoded.push(chunk.slice()) // (.slice converts BufferList to Buffer)
    }
  }
)

console.log(decoded)
// => [Buffer <68 65 6c 6c 6f 20 77 6f 72 6c 64>]
```

## API

### `encode([opts])`

- `opts: Object`, optional
  - `poolSize: 10 * 1024`: Buffer pool size to allocate up front
  - `minPoolSize: 8`: The minimum size the pool can be before it is re-allocated. Note: it is important this value is greater than the maximum value that can be encoded by the `lengthEncoder` (see the next option). Since encoded lengths are written into a buffer pool, there needs to be enough space to hold the encoded value.
  - `lengthEncoder: Function`: A function that encodes the length that will prefix each message. By default this is a [`varint`](https://www.npmjs.com/package/varint) encoder. It is passed a `value` to encode, an (optional) `target` buffer to write to and an (optional) `offset` to start writing from. The function should encode the `value` into the `target` (or alloc a new Buffer if not specified), set the `lengthEncoder.bytes` value (the number of bytes written) and return the `target`.
    - The following additional length encoders are available:
      - **int32BE** - `const { int32BEEncode } = require('it-length-prefixed')`

Returns a [transform](https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9#transform-it) that yields [`BufferList`](https://www.npmjs.com/package/bl) objects. All messages will be prefixed with a length, determined by the `lengthEncoder` function.

### `encode.single(chunk, [opts])`

- `chunk: Buffer|BufferList` chunk to encode
- `opts: Object`, optional
    - `lengthEncoder: Function`: See description above. Note that this encoder will _not_ be passed a `target` or `offset` and so will need to allocate a buffer to write to.

Returns a `BufferList` containing the encoded chunk.

### `decode([opts])`

- `opts: Object`, optional
  - `maxLengthLength`: If provided, will not decode messages whose length section exceeds the size specified, if omitted will use the default of 147 bytes.
  - `maxDataLength`: If provided, will not decode messages whose data section exceeds the size specified, if omitted will use the default of 4MB.
  - `onLength(len: Number)`: Called for every length prefix that is decoded from the stream
  - `onData(data: BufferList)`: Called for every chunk of data that is decoded from the stream
  - `lengthDecoder: Function`: A function that decodes the length that prefixes each message. By default this is a [`varint`](https://www.npmjs.com/package/varint) decoder. It is passed some `data` to decode which is a [`BufferList`](https://www.npmjs.com/package/bl). The function should decode the length, set the `lengthDecoder.bytes` value (the number of bytes read) and return the length. If the length cannot be decoded, the function should throw a `RangeError`.
    - The following additional length decoders are available:
      - **int32BE** - `const { int32BEDecode } = require('it-length-prefixed')`

Returns a [transform](https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9#transform-it) that yields [`BufferList`](https://www.npmjs.com/package/bl) objects.

### `decode.fromReader(reader, [opts])`

Behaves like `decode` except it only reads the exact number of bytes needed for each message in `reader`.

- `reader: Reader`: An [it-reader](https://github.com/alanshaw/it-reader)
- `opts: Object`, optional
  - `maxLengthLength`: If provided, will not decode messages whose length section exceeds the size specified, if omitted will use the default of 147 bytes.
  - `maxDataLength`: If provided, will not decode messages whose data section exceeds the size specified, if omitted will use the default of 4MB.
  - `onData(data: BufferList)`: Called for every chunk of data that is decoded from the stream
  - `lengthEncoder: Function`: See description above.

Returns a [transform](https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9#transform-it) that yields [`BufferList`](https://www.npmjs.com/package/bl) objects.

## Contribute

PRs and issues gladly accepted! Check out the [issues](https://github.com/alanshaw/it-length-prefixed/issues).

## License

MIT © 2016 Friedel Ziegelmayer
