# Uint8Arrays <!-- omit in toc -->

Some utility functions to make dealing with `Uint8Array`s more pleasant.

- [API](#api)
  - [compare(a, b)](#comparea-b)
    - [Example](#example)
  - [concat(arrays, [length])](#concatarrays-length)
    - [Example](#example-1)
  - [equals(a, b)](#equalsa-b)
    - [Example](#example-2)
  - [fromString(string, encoding = 'utf8')](#fromstringstring-encoding--utf8)
    - [Example](#example-3)
  - [toString(array, encoding = 'utf8')](#tostringarray-encoding--utf8)
    - [Example](#example-4)

## API

### compare(a, b)

Compare two `Uint8Arrays`

#### Example

```js
const compare = require('uint8arrays/compare')

const arrays = [
  Uint8Array.from([3, 4, 5]),
  Uint8Array.from([0, 1, 2])
]

const sorted = arrays.sort(compare)

console.info(sorted)
// [
//    Uint8Array[0, 1, 2]
//    Uint8Array[3, 4, 5]
// ]
```

### concat(arrays, [length])

Concatenate one or more array-likes and return a `Uint8Array` with their contents.

If you know the length of the arrays, pass it as a second parameter, otherwise it will be calculated by traversing the list of arrays.

#### Example

```js
const concat = require('uint8arrays/concat')

const arrays = [
  Uint8Array.from([0, 1, 2]),
  Uint8Array.from([3, 4, 5])
]

const all = concat(arrays, 6)

console.info(all)
// Uint8Array[0, 1, 2, 3, 4, 5]
```

### equals(a, b)

Returns true if the two arrays are the same array or if they have the same length and contents.

#### Example

```js
const equals = require('uint8arrays/equals')

const a = Uint8Array.from([0, 1, 2])
const b = Uint8Array.from([3, 4, 5])
const c = Uint8Array.from([0, 1, 2])

console.info(equals(a, b)) // false
console.info(equals(a, c)) // true
console.info(equals(a, a)) // true
```

### fromString(string, encoding = 'utf8')

Returns a new `Uint8Array` created from the passed string and interpreted as the passed encoding.

Supports `utf8` and any of the [multiformats encodings](https://www.npmjs.com/package/multibase#supported-encodings-see-srcconstantsjs).

#### Example

```js
const fromString = require('uint8arrays/from-string')

console.info(fromString('hello world')) // Uint8Array[104, 101 ...
console.info(fromString('00010203aabbcc', 'base16')) // Uint8Array[0, 1 ...
console.info(fromString('AAECA6q7zA', 'base64')) // Uint8Array[0, 1 ...
console.info(fromString('01234', 'ascii')) // Uint8Array[48, 49 ...
```

### toString(array, encoding = 'utf8')

Returns a string created from the passed `Uint8Array` in the passed encoding.

Supports `utf8` and any of the [multiformats encodings](https://www.npmjs.com/package/multibase#supported-encodings-see-srcconstantsjs).

#### Example

```js
const fromString = require('uint8arrays/from-string')

console.info(toString(Uint8Array.from([104, 101...]))) // 'hello world'
console.info(toString(Uint8Array.from([0, 1, 2...]), 'base16')) // '00010203aabbcc'
console.info(toString(Uint8Array.from([0, 1, 2...]), 'base64')) // 'AAECA6q7zA'
console.info(toString(Uint8Array.from([48, 49, 50...]), 'ascii')) // '01234'
```
