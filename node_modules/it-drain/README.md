# it-drain

[![Build status](https://travis-ci.org/achingbrain/it.svg?branch=master)](https://travis-ci.org/achingbrain/it?branch=master) [![Coverage Status](https://coveralls.io/repos/github/achingbrain/it/badge.svg?branch=master)](https://coveralls.io/github/achingbrain/it?branch=master) [![Dependencies Status](https://david-dm.org/achingbrain/it/status.svg?path=packages/it-drain)](https://david-dm.org/achingbrain/it?path=packages/it-drain)

> Drains an (async) iterable discarding its content and does not return anything.

Mostly useful for tests or when you want to be explicit about consuming an iterable without doing anything with any yielded values.

## Install

```sh
$ npm install --save it-drain
```

## Usage

```javascript
const drain = require('it-drain')

// This can also be an iterator, async iterator, generator, etc
const values = [0, 1, 2, 3, 4]

await drain(values)
```
