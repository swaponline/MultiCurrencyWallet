# it-filter

[![Build status](https://travis-ci.org/achingbrain/it.svg?branch=master)](https://travis-ci.org/achingbrain/it?branch=master) [![Coverage Status](https://coveralls.io/repos/github/achingbrain/it/badge.svg?branch=master)](https://coveralls.io/github/achingbrain/it?branch=master) [![Dependencies Status](https://david-dm.org/achingbrain/it/status.svg?path=packages/it-all)](https://david-dm.org/achingbrain/it?path=packages/it-all)

> Filters the passed (async) iterable by using the filter function

## Install

```sh
$ npm install --save it-filter
```

## Usage

```javascript
const all = require('it-all')
const filter = require('it-filter')

// This can also be an iterator, async iterator, generator, etc
const values = [0, 1, 2, 3, 4]

const fn = val => val > 2 // Return boolean or promise of boolean to keep item

const arr = await all(filter(values, fn))

console.info(arr) // 3, 4
```
