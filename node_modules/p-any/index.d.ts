import PCancelable = require('p-cancelable');
import {
	Options as PSomeOptions,
	AggregateError as PSomeAggregateError
} from 'p-some';

declare namespace pAny {
	type Value<ValueType> = ValueType | PromiseLike<ValueType>;
	type Options<ValueType> = Omit<PSomeOptions<ValueType>, 'count'>;
	type CancelablePromise<ValueType> = PCancelable<ValueType>;
	type AggregateError = PSomeAggregateError;
}

declare const pAny: {
	/**
	Wait for any promise to be fulfilled.

	@param input - An `Iterable` collection of promises/values to wait for.
	@returns A [cancelable `Promise`](https://github.com/sindresorhus/p-cancelable) that is fulfilled when any promise from `input` is fulfilled. If all the input promises reject, it will reject with an [`AggregateError`](https://github.com/sindresorhus/aggregate-error) error.

	@example
	```
	import got = require('got');
	import pAny = require('p-any');

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
	 */
	<ValueType>(
		input: Iterable<pAny.Value<ValueType>>,
		options?: pAny.Options<ValueType>
	): pAny.CancelablePromise<ValueType>;

	AggregateError: typeof PSomeAggregateError;
};

export = pAny;
