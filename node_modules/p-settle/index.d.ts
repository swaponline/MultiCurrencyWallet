import * as pReflect from 'p-reflect';

declare namespace pSettle {
	interface Options {
		/**
		Number of concurrently pending promises.

		Must be an integer from 1 and up or `Infinity`.

		Note: This only limits concurrency for elements that are async functions, not promises.

		@default Infinity
		*/
		readonly concurrency?: number;
	}

	type PromiseResult<ValueType> = pReflect.PromiseResult<ValueType>;
	type PromiseFulfilledResult<ValueType> = pReflect.PromiseFulfilledResult<ValueType>;
	type PromiseRejectedResult = pReflect.PromiseRejectedResult;
	type ReturnValue<T> = T extends (...args: any) => any ? ReturnType<T> : T;

	// TODO: Use the native version when TS supports it (should be in v4).
	type Awaited<T> = T extends undefined ? T : T extends PromiseLike<infer U> ? U : T;
}

/**
Settle promises concurrently and get their fulfillment value or rejection reason.

@param array - Can contain a mix of any value, promise, and async function. Promises are awaited. Async functions are executed and awaited. The `concurrency` option only works for elements that are async functions.
@returns A promise that is fulfilled when all promises from the `array` argument are settled.

@example
```
import {promises as fs} from 'fs';
import pSettle = require('p-settle');

(async () => {
	const files = [
		'a.txt',
		'b.txt' // Doesn't exist
	].map(fileName => fs.readFile(fileName, 'utf8'));

	console.log(await pSettle(files));
	// [
	// 	{
	// 		isFulfilled: true,
	// 		isRejected: false,
	// 		value: '🦄'
	// 	},
	// 	{
	// 		isFulfilled: false,
	// 		isRejected: true,
	// 		reason: [Error: ENOENT: no such file or directory, open 'b.txt']
	// 	}
	// ]
})();
```
*/
declare function pSettle<ValueType extends readonly any[]>(
	array: ValueType,
	options?: pSettle.Options
): Promise<{-readonly [P in keyof ValueType]: pSettle.PromiseResult<pSettle.Awaited<pSettle.ReturnValue<ValueType[P]>>>}>;

export = pSettle;
