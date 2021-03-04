# @iterables/chain

Chain multiple iterators together.

```javascript
const chain = require('@iterables/chain')

console.log([...chain([1,2,3], 'abc')]) // [1, 2, 3, 'a', 'b', 'c']
```

## Installation

```
$ npm install --save @iterables/chain
```

## API

### `chain(...iterators) -> Iterator`

Chain an arbitrary number of iterators together, returning a new iterator.

## License

MIT
