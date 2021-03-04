import PCancelable = require('p-cancelable');
import AggregateError = require('aggregate-error');

type AggregateError_ = AggregateError;
type AggregateErrorConstructor = typeof AggregateError;

declare namespace pSome {
	type Value<T> = T | PromiseLike<T>;
	type CancelablePromise<ValueType> = PCancelable<ValueType>;

	interface Options<T> {
		/**
		Number of promises from `input` that have to be fulfilled until the returned promise is fulfilled. Minimum: `1`.
		*/
		readonly count: number;

		/**
		Used to filter out values that don't satisfy a condition.

		@param value - The value resolved by the promise.
		*/
		readonly filter?: (value: T) => boolean;
	}

	type AggregateError = AggregateError_;
	interface FilterError extends Error {}
}

declare const pSome: {
	/**
	Wait for a specified number of promises to be fulfilled.

	@param values - An `Iterable` collection of promises/values to wait for. If you pass in cancelable promises, specifically promises with a `.cancel()` method, that method will be called for the promises that are still unfulfilled when the returned `Promise` is either fulfilled or rejected.
	@returns A [cancelable `Promise`](https://github.com/sindresorhus/p-cancelable) that is fulfilled when `count` promises from `input` are fulfilled. The fulfilled value is an `Array` of the values from the `input` promises in the order they were fulfilled. If it becomes impossible to satisfy `count`, for example, too many promises rejected, it will reject with an [`AggregateError`](https://github.com/sindresorhus/aggregate-error) error.

	@example
	```
	import got = require('got');
	import pSome = require('p-some');

	(async () => {
		const input = [
			got.head('github.com').then(() => 'github'),
			got.head('google.com').then(() => 'google'),
			got.head('twitter.com').then(() => 'twitter'),
			got.head('medium.com').then(() => 'medium')
		];

		const [first, second] = await pSome(input, {count: 2});

		console.log(first, second);
		//=> 'google twitter'
	})();
	```
	*/
	<T>(
		values: Iterable<pSome.Value<T>>,
		options: pSome.Options<T>
	): pSome.CancelablePromise<T[]>;

	AggregateError: AggregateErrorConstructor;
	FilterError: pSome.FilterError;
};

export = pSome;
