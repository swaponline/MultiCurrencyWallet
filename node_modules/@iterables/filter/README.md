# @iterables/filter

A filter generator for iterators.

```javascript

const filter = require('@iterables/filter')

const iter = filter(function * () {
  yield 1
  yield 2
}(), xs => xs % 2 === 0)

console.log([...iter]) // [2]
```

## Installation

```
$ npm install --save @iterables/filter
```

## API

### `filter(iterable, fn) -> Iterator`

* `iterable`: any `Iterator` — a generator instance, `Array`, `Map`, `String`, or `Set`
* `fn`: A function taking `xs`, `idx`, and `all` and returning a boolean value.
  * `xs`: an item from `iterable`.
  * `idx`: a number reflecting the index of the current item.
  * `all`: the full `iterable` object.

Returns a filtered iterator. Pretty standard stuff!

## License

MIT
