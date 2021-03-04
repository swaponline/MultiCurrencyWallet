# it-take

[![Build status](https://travis-ci.org/achingbrain/it.svg?branch=master)](https://travis-ci.org/achingbrain/it?branch=master) [![Coverage Status](https://coveralls.io/repos/github/achingbrain/it/badge.svg?branch=master)](https://coveralls.io/github/achingbrain/it?branch=master) [![Dependencies Status](https://david-dm.org/achingbrain/it/status.svg?path=packages/it-take)](https://david-dm.org/achingbrain/it?path=packages/it-take)

> Stop iteration after n items have been received.

For when you only want a few values out of an iterable.

## Install

```sh
$ npm install --save it-take
```

## Usage

```javascript
const take = require('it-take')
const all = require('it-all')

// This can also be an iterator, async iterator, generator, etc
const values = [0, 1, 2, 3, 4]

const arr = await all(take(values, 2))

console.info(arr) // 0, 1
```
