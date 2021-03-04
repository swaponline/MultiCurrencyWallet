# hyperdiff

![Last version](https://img.shields.io/github/tag/Kikobeats/hyperdiff.svg?style=flat-square)
[![Build Status](https://img.shields.io/travis/com/Kikobeats/hyperdiff/master.svg?style=flat-square)](https://travis-ci.com/github/Kikobeats/hyperdiff)
[![Coverage Status](https://img.shields.io/coveralls/Kikobeats/hyperdiff.svg?style=flat-square)](https://coveralls.io/github/Kikobeats/hyperdiff)
[![Dependency status](https://img.shields.io/david/Kikobeats/hyperdiff.svg?style=flat-square)](https://david-dm.org/Kikobeats/hyperdiff)
[![Dev Dependencies Status](https://img.shields.io/david/dev/Kikobeats/hyperdiff.svg?style=flat-square)](https://david-dm.org/Kikobeats/hyperdiff#info=devDependencies)
[![NPM Status](https://img.shields.io/npm/dm/hyperdiff.svg?style=flat-square)](https://www.npmjs.org/package/hyperdiff)

> Find common, removed and added element between two collections.

## Install

```bash
$ npm install hyperdiff --save
```

## Usage

Using a flat `Array`:

```js
const diff = require('hyperdiff')

var result = diff(
  [1, 2, 3, 4, 5, 6],
  [1, 2, 4, 5, 6, 0, 9, 10]
)

console.log(result)
// {
//   added: [ 0, 9, 10 ],
//   removed: [ 3 ],
//   common: [ 1, 2, 4, 5, 6 ]
// }
```

Using an `Array` of `Object`'s (in this case you need to provide the unique id):

```js
const diff = require('hyperdiff')
var result = diff(
  [
    { id: 1, name: 'a' },
    { id: 2, name: 'b' },
    { id: 3, name: 'c' },
    { id: 4, name: 'd' },
    { id: 5, name: 'e' }
  ],
  [
    { id: 1, name: 'a' },
    { id: 2, name: 'b' },
    { id: 7, name: 'e' }
  ],
  'id'
)

console.log(result)
// {
//   added: [ { id: 7, name: 'e' } ],
//   removed: [ { id: 3, name: 'c' }, { id: 4, name: 'd' }, { id: 5, name: 'e' } ],
//   common: [ { id: 1, name: 'a' }, { id: 2, name: 'b' } ]
// }
```

It's also support multiple properties as id or provide a `function`.

## Benchmark

```bash
❯ node bench.js
simpleArrayDiff*1000: 143.742ms
hyperDiff*1000: 80.234ms
simpleArrayDiff*1000: 143.405ms
hyperDiff*1000: 75.803ms
```

## API

### hyperdiff(orig, dist, [ids])

#### orig

*Required*<br>
Type: `array`

First array for be compared.

#### dist

*Required*<br>
Type: `array`

Second array for be compared. Notes the results are modeled from the second array.

#### ids

Type: `string`|`array`|`function`

In the case that you provide an `Array` of `Object`'s, you need to specify the `key`'s to be used as `id`.

## Related

* [redis-diff](https://github.com/Kikobeats/redis-diff) - Perform a diff comparison backed by redis.

## License

MIT © [Kiko Beats](https://github.com/Kikobeats).
