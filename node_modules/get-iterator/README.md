# get-iterator

[![Build Status](https://travis-ci.org/alanshaw/get-iterator.svg?branch=master)](https://travis-ci.org/alanshaw/get-iterator) [![dependencies Status](https://david-dm.org/alanshaw/get-iterator/status.svg)](https://david-dm.org/alanshaw/get-iterator) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

> Get the default iterator or async iterator for an Iterable.

Reduce the boilerplate of extracting the iterator from an object when you don't know if the object is an (async) iterable or already an (async) iterator.

## Install

```sh
npm install get-iterator
```

## Usage

```js
const getIterator = require('get-iterator')
const input = [1, 2, 3]
const it = getIterator(input)
console.log(it.next()) // { done: false, value: 1 }
console.log(it.next()) // { done: false, value: 2 }
console.log(it.next()) // { done: false, value: 3 }
console.log(it.next()) // { done: true, value: undefined }
```

### Examples

Regular iterator from iterable:

```js
const getIterator = require('get-iterator')

const input = [1, 2, 3]
const iterable = {
  [Symbol.iterator] () {
    let i = 0
    return {
      next () {
        const value = input[i++]
        return { done: !value, value }
      }
    }
  }
}

const it = getIterator(input)
console.log(it.next()) // { done: false, value: 1 }
console.log(it.next()) // { done: false, value: 2 }
console.log(it.next()) // { done: false, value: 3 }
console.log(it.next()) // { done: true, value: undefined }
```

Async iterator from iterable:

```js
const getIterator = require('get-iterator')

const input = [1, 2, 3]
const iterable = {
  [Symbol.asyncIterator] () {
    let i = 0
    return {
      async next () {
        const value = await new Promise((resolve, reject) => {
          setTimeout(() => resolve(input[i++]), 10)
        })
        return { done: !value, value }
      }
    }
  }
}

const it = getIterator(iterable)
console.log(await it.next()) // { done: false, value: 1 }
console.log(await it.next()) // { done: false, value: 2 }
console.log(await it.next()) // { done: false, value: 3 }
console.log(await it.next()) // { done: true, value: undefined }
```

Already an iterator (probably):

```js
const getIterator = require('get-iterator')

const input = [1, 2, 3]
let i = 0
const iterator = {
  next () {
    const value = input[i++]
    return { done: !value, value }
  }
}

const it = getIterator(iterator)
console.log(it.next()) // { done: false, value: 1 }
console.log(it.next()) // { done: false, value: 2 }
console.log(it.next()) // { done: false, value: 3 }
console.log(it.next()) // { done: true, value: undefined }
```

## API

```js
const getIterator = require('get-iterator')
```

### `getIterator(obj)`

Get the default iterator or async iterator for an Iterable. If `obj` is already an iterator (i.e. has a `next` function) return it, since it's probably already an iterator.

This function will throw if `obj` is not an iterable or iterator.

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| obj | [`Iterable`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol)\|[`Iterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterator_protocol) | The object to extract the iterator from (may be an iterator already). |

#### Returns

| Type | Description |
|------|-------------|
| [`Iterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterator_protocol) | The result of calling `obj[Symbol.iterator]()` or `obj[Symbol.asyncIterator]()` or simply the passed `obj` if it is already an iterator. |

## Contribute

Feel free to dive in! [Open an issue](https://github.com/alanshaw/get-iterator/issues/new) or submit PRs.

## License

[MIT](https://github.com/alanshaw/get-iterator/blob/master/LICENSE) © Alan Shaw
