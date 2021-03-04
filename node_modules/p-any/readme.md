# p-any [![Build Status](https://travis-ci.org/sindresorhus/p-any.svg?branch=master)](https://travis-ci.org/sindresorhus/p-any)

> Wait for any promise to be fulfilled

Useful when you need the fastest promise.

You probably want this instead of `Promise.race()`. [Reason.](http://bluebirdjs.com/docs/api/promise.race.html)

## Install

```
$ npm install p-any
```

## Usage

Checks 3 websites and logs the fastest.

```js
const got = require('got');
const pAny = require('p-any');

(async () => {
	const first = await pAny([
		got.head('https://github.com').then(() => 'github'),
		got.head('https://google.com').then(() => 'google'),
		got.head('https://twitter.com').then(() => 'twitter'),
	]);

	console.log(first);
	//=> 'google'
})();
```

## API

### pAny(input, options?)

Returns a [cancelable `Promise`](https://github.com/sindresorhus/p-cancelable) that is fulfilled when any promise from `input` is fulfilled. If all the `input` promises reject, it will reject with an [`AggregateError`](https://github.com/sindresorhus/aggregate-error) error.

#### input

Type: `Iterable<Promise|any>`

#### options

Type: `object`

##### filter

Type: `Function`

Receives the value resolved by the promise. Used to filter out values that doesn't satisfy a condition.

### pAny.AggregateError

Exposed for instance checking.

## Related

- [p-some](https://github.com/sindresorhus/p-some) - Wait for a specified number of promises to be fulfilled
- [p-locate](https://github.com/sindresorhus/p-locate) - Get the first fulfilled promise that satisfies the provided testing function
- [More…](https://github.com/sindresorhus/promise-fun)
