# p-times [![Build Status](https://travis-ci.com/sindresorhus/p-times.svg?branch=master)](https://travis-ci.com/sindresorhus/p-times)

> Run promise-returning & async functions a specific number of times concurrently

## Install

```
$ npm install p-times
```

## Usage

```js
const pTimes = require('p-times');

(async () => {
	const result = await pTimes(5, i => createFixture(`🦄-${i + 1}`));

	console.log(`Created fixtures: ${result.join(' ')}`);
	//=> 'Created fixtures: 🦄-1 🦄-2 🦄-3 🦄-4 🦄-5'
})();
```

## API

### pTimes(count, mapper, options?)

Returns a `Promise` that is fulfilled when all promises returned from `mapper` are fulfilled, or rejects if any of the promises reject. The fulfilled value is an `Array` of the fulfilled values returned from `mapper` in order.

#### count

Type: `number`

Number of times to call `mapper`.

#### mapper(index)

Type: `Function`

Expected to return a `Promise` or value.

#### options

Type: `object`

##### concurrency

Type: `number`\
Default: `Infinity`\
Minimum: `1`

Number of concurrently pending promises returned by `mapper`.

##### stopOnError

Type: `boolean`\
Default: `true`

When set to `false`, instead of stopping when a promise rejects, it will wait for all the promises to settle and then reject with an [aggregated error](https://github.com/sindresorhus/aggregate-error) containing all the errors from the rejected promises.

## Related

- [p-forever](https://github.com/sindresorhus/p-forever) - Run promise-returning & async functions repeatedly until you end it
- [p-map](https://github.com/sindresorhus/p-map) - Map over promises concurrently
- [p-filter](https://github.com/sindresorhus/p-filter) - Filter promises concurrently
- [More…](https://github.com/sindresorhus/promise-fun)
