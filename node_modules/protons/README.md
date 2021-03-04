# protons <!-- omit in toc -->

[![Dependency Status](https://david-dm.org/ipfs/protons.svg?style=flat-square)](https://david-dm.org/ipfs/protons)
[![Travis CI](https://travis-ci.org/ipfs/protons.svg?branch=master)](https://travis-ci.org/ipfs/protons)

> [Protocol Buffers](https://developers.google.com/protocol-buffers/) for Node.js and the browser without compilation.
>
> Forked from [protocol-buffers](https://github.com/mafintosh/protocol-buffers).

## Lead Maintainer <!-- omit in toc -->

[Alex Potsides](https://github.com/achingbrain)

## Table of Contents <!-- omit in toc -->

- [Install](#install)
- [Usage](#usage)
- [Properties](#properties)
- [Performance](#performance)
- [Leveldb encoding compatibility](#leveldb-encoding-compatibility)
- [License](#license)

## Install

```sh
> npm install protons
```

## Usage

Assuming the following `test.proto` file exists

```proto
enum FOO {
  BAR = 1;
}

message Test {
  required float num  = 1;
  required string payload = 2;
}

message AnotherOne {
  repeated FOO list = 1;
}

message WithOptional {
  optional string payload = 1;
}
```

Use the above proto file to encode/decode messages by doing

``` js
const protons = require('protons')

// pass a proto file as a buffer/string or pass a parsed protobuf-schema object
const messages = protons(fs.readFileSync('test.proto'))

const buf = messages.Test.encode({
  num: 42,
  payload: 'hello world'
})

console.log(buf) // should print a buffer
```

To decode a message use `Test.decode`

``` js
const obj = messages.Test.decode(buf)
console.log(obj) // should print an object similar to above
```

Enums are accessed in the same way as messages

``` js
const buf = messages.AnotherOne.encode({
  list: [
    messages.FOO.BAR
  ]
})
```

Nested emums are accessed as properties on the corresponding message

``` js
const buf = message.SomeMessage.encode({
  list: [
    messages.SomeMessage.NESTED_ENUM.VALUE
  ]
})
```

See the [Google Protocol Buffers docs](https://developers.google.com/protocol-buffers/) for more information about the
available types etc.

## Properties

Decoded object properties can be interacted with using accessor methods:

```javascript
 const obj = messages.WithOptional.decode(messages.WithOptional.encode({}))

obj.hasPayload() // false
obj.getPayload() // ''
obj.setPayload('hello world')
obj.getPayload() // 'hello world'
obj.clearPayload()
obj.getPayload() // undefined
```

## Performance

This module is pretty fast.

You can run the benchmarks yourself by doing `npm run bench`.

On my Macbook Pro it gives the following results

```
JSON (encode) x 703,160 ops/sec ±2.06% (91 runs sampled)
JSON (decode) x 619,564 ops/sec ±1.60% (94 runs sampled)
JSON (encode + decode) x 308,635 ops/sec ±1.74% (92 runs sampled)
protocol-buffers@4.1.0 (encode) x 693,570 ops/sec ±1.55% (92 runs sampled)
protocol-buffers@4.1.0 (decode) x 1,894,031 ops/sec ±1.61% (93 runs sampled)
protocol-buffers@4.1.0 (encode + decode) x 444,229 ops/sec ±1.50% (93 runs sampled)
protons@1.0.1 (encode) x 435,058 ops/sec ±1.46% (91 runs sampled)
protons@1.0.1 (decode) x 29,548 ops/sec ±3.29% (78 runs sampled)
protons@1.0.1 (encode + decode) x 27,042 ops/sec ±4.41% (80 runs sampled)
```

Note that JSON parsing/serialization in node is a native function that is *really* fast.

## Leveldb encoding compatibility

Compiled protocol buffers messages are valid levelup encodings.
This means you can pass them as `valueEncoding` and `keyEncoding`.

``` js
const level = require('level')
const db = level('db')

db.put('hello', {payload:'world'}, {valueEncoding:messages.Test}, (err) => {
  db.get('hello', {valueEncoding:messages.Test}, (err, message) => {
    console.log(message)
  })
})
```

## License

MIT
