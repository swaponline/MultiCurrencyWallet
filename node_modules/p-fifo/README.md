# p-fifo

[![Build Status](https://travis-ci.org/alanshaw/p-fifo.svg?branch=master)](https://travis-ci.org/alanshaw/p-fifo)
[![dependencies Status](https://david-dm.org/alanshaw/p-fifo/status.svg)](https://david-dm.org/alanshaw/p-fifo)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

> Promised First-In-First-Out buffer. Await on push to be told when a value is consumed and await on shift for a value to consume when the buffer is empty

## Install

```sh
npm i p-fifo
```

## Usage

### Await on push

`await` on push to be told when your pushed value is consumed:

```js
const Fifo = require('p-fifo')
const fifo = new Fifo()

// Consume a value from the buffer after 1 second
setTimeout(() => fifo.shift(), 1000)

console.time('push')
// Nothing in the buffer, push a value and wait for it to be consumed
await fifo.push('hello')
console.log('"hello" was consumed')
console.timeEnd('push')

// Output:
// "hello" was consumed
// push: 1006.723ms
```

### Await on shift

If the buffer is empty, you can `await` on a value to be pushed:

```js
const Fifo = require('p-fifo')
const fifo = new Fifo()

// Push a value into the buffer after 1 second
setTimeout(() => fifo.push('hello'), 1000)

console.time('shift')
// Nothing in the buffer, wait for something to arrive
const value = await fifo.shift()
console.log(`consumed "${value}" from the buffer`)
console.timeEnd('shift')

// Output:
// consumed "hello" from the buffer
// shift: 1002.652ms
```

## API

```js
const fifo = new Fifo()
```

### `fifo.push(value): Promise`

Add a value to the end of the FIFO buffer.

Returns a promise that is resolved when the pushed value is shifted off the start of the buffer.

### `fifo.shift(): Promise<Any>`

Remove the first value from the FIFO buffer and return that removed value in a promise.

Returns a promise that resolves to a value from start of the FIFO buffer. If there are no values in the buffer the promise will resolve when a value is next pushed.

Note that multiple calls to shift when the buffer is empty will not resolve to the same value i.e. a corresponding number of calls to `push` will need to be made to resolve all the promises returned by calls to `shift`.

### `fifo.isEmpty(): Boolean`

Returns `true` if the FIFO buffer is empty and `false` otherwise.

## Contribute

Feel free to dive in! [Open an issue](https://github.com/alanshaw/p-fifo/issues/new) or submit PRs.

## License

[MIT](LICENSE) © Alan Shaw
