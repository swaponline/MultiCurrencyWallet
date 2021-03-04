# it-pipe


[![Build Status](https://travis-ci.org/alanshaw/it-pipe.svg?branch=master)](https://travis-ci.org/alanshaw/it-pipe)
[![dependencies Status](https://david-dm.org/alanshaw/it-pipe/status.svg)](https://david-dm.org/alanshaw/it-pipe)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

> Utility to "pipe" async iterables together

Based on this definition of streaming iterables https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9.

Almost identical to the [`pipeline`](https://github.com/bustle/streaming-iterables#pipeline) function from the [`streaming-iterables`](https://www.npmjs.com/package/streaming-iterables) module except that it supports duplex streams _and_ will automatically wrap a "source" as the first param in a function.

## Install

```sh
npm i it-pipe
```

## Usage

```js
const pipe = require('it-pipe')

const result = await pipe(
  // A source is just an iterable, this is shorthand for () => [1, 2, 3]
  [1, 2, 3],
  // A transform takes a source, and returns a source.
  // This transform doubles each value asynchronously.
  function transform (source) {
    return (async function * () { // A generator is async iterable
      for await (const val of source) yield val * 2
    })()
  },
  // A sink, it takes a source and consumes it, optionally returning a value.
  // This sink buffers up all the values from the source and returns them.
  async function collect (source) {
    const vals = []
    for await (const val of source) {
      vals.push(val)
    }
    return vals
  }
)

console.log(result) // 2,4,6
```

## API

### `pipe(firstFn, ...fns)`

Calls `firstFn` and then every function in `fns` with the result of the previous function. The final return is the result of the last function in `fns`.

Note:

* `firstFn` may be a `Function` or an `Iterable`
* `firstFn` or any of `fns` may be a [duplex object](https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9#duplex-it) (an object with a `sink` and `source`).


## Contribute

Feel free to dive in! [Open an issue](https://github.com/alanshaw/it-pipe/issues/new) or submit PRs.

## License

[MIT](LICENSE) © Alan Shaw
