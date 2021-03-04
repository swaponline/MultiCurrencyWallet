# p-reflect [![Build Status](https://travis-ci.org/sindresorhus/p-reflect.svg?branch=master)](https://travis-ci.org/sindresorhus/p-reflect)

> Make a promise always fulfill with its actual fulfillment value or rejection reason

Useful when you want a promise to fulfill no matter what and would rather handle the actual state afterwards.


## Install

```
$ npm install p-reflect
```


## Usage

Here, `Promise.all` would normally fail early because one of the promises rejects, but by using `p-reflect`, we can ignore the rejection and handle it later on.

```js
const pReflect = require('p-reflect');

(async () => {
	const promises = [
		getPromise(),
		getPromiseThatRejects(),
		getPromise()
	];

	const results = await Promise.all(promises.map(pReflect));

	console.log(results);
	/*
	[
		{
			isFulfilled: true,
			isRejected: false,
			value: '🦄'
		},
		{
			isFulfilled: false,
			isRejected: true,
			reason: [Error: 👹]
		},
		{
			isFulfilled: true,
			isRejected: false,
			value: '🐴'
		}
	]
	*/

	const resolvedString = results
		.filter(result => result.isFulfilled)
		.map(result => result.value)
		.join('');

	console.log(resolvedString);
	//=> '🦄🐴'
})();
```

The above is just an example. Use [`p-settle`](https://github.com/sindresorhus/p-settle) if you need this.


## API

### pReflect(promise)

Returns a `Promise<Object>`.

The object has the following properties:

- `isFulfilled`
- `isRejected`
- `value` or `reason` *(Depending on whether the promise fulfilled or rejected)*

#### promise

Type: `Promise`

A promise to reflect upon.


## Related

- [p-settle](https://github.com/sindresorhus/p-settle) - Settle promises concurrently and get their fulfillment value or rejection reason
- [More…](https://github.com/sindresorhus/promise-fun)


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
