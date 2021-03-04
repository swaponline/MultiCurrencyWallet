# it-pushable

[![Build Status](https://travis-ci.org/alanshaw/it-pushable.svg?branch=master)](https://travis-ci.org/alanshaw/it-pushable)
[![dependencies Status](https://david-dm.org/alanshaw/it-pushable/status.svg)](https://david-dm.org/alanshaw/it-pushable)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

> An iterable that you can push values into

## Install

```sh
npm install it-pushable
```

## Usage

```js
const pushable = require('it-pushable')
const source = pushable()

setTimeout(() => source.push('hello'), 100)
setTimeout(() => source.push('world'), 200)
setTimeout(() => source.end(), 300)

const start = Date.now()

for await (const value of source) {
  console.log(`got "${value}" after ${Date.now() - start}ms`)
}
console.log(`done after ${Date.now() - start}ms`)

/*
Output:
got "hello" after 105ms
got "world" after 207ms
done after 309ms
*/
```

## API

### `pushable([options])`

Create a new async iterable. The values yielded from calls to `.next()` or when used in a `for await of` loop are "pushed" into the iterable. Returns an async iterable object with the following additional methods:

* `.push(value)` - push a value into the iterable. Values are yielded from the iterable in the order they are pushed. Values not yet consumed from the iterable are buffered
* `.end([err])` - end the iterable after all values in the buffer (if any) have been yielded. If an error is passed the buffer is cleared immediately and the next iteration will throw the passed error

`options` is an _optional_ parameter, an object with the following properties:

* `onEnd` - a function called after _all_ values have been yielded from the iterator (including buffered values). In the case when the iterator is ended with an error it will be passed the error as a parameter.
* `writev` - a boolean used to signal that the consumer of this iterable supports processing multiple buffered chunks at a time. When this option is set to `true` values yielded from the iterable will be arrays.

Note: the `onEnd` function may be passed instead of `options`.

## Related

* [`it-pipe`](https://www.npmjs.com/package/it-pipe) Utility to "pipe" async iterables together

## Contribute

Feel free to dive in! [Open an issue](https://github.com/alanshaw/it-pushable/issues/new) or submit PRs.

## License

[MIT](LICENSE) © Alan Shaw
