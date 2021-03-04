# @sets/intersection

Return the intersection between two sets.

```javascript
const intersection = require('@sets/intersection')

console.log(intersection(
  new Set('hello'),
  new Set('world')
)) // "lo"
```

## Installation

```
$ npm install --save @sets/intersection
```

## API

### `intersection(lhs, rhs) -> Set`

Return the intersection between the sets represented by `lhs` and `rhs`. The
resulting set will contain all elements that appear in both `lhs` and `rhs`.

## License

MIT
