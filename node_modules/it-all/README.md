# it-all

[![Build status](https://travis-ci.org/achingbrain/it.svg?branch=master)](https://travis-ci.org/achingbrain/it?branch=master) [![Coverage Status](https://coveralls.io/repos/github/achingbrain/it/badge.svg?branch=master)](https://coveralls.io/github/achingbrain/it?branch=master) [![Dependencies Status](https://david-dm.org/achingbrain/it/status.svg?path=packages/it-all)](https://david-dm.org/achingbrain/it?path=packages/it-all)

> Collects all values from an (async) iterable into an array and returns it.

For when you need a one-liner to collect iterable values.

## Install

```sh
$ npm install --save it-all
```

## Usage

```javascript
const all = require('it-all')

// This can also be an iterator, async iterator, generator, etc
const values = [0, 1, 2, 3, 4]

const arr = await all(values)

console.info(arr) // 0, 1, 2, 3, 4
```
