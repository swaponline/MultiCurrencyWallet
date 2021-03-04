import {Options as PMapOptions} from 'p-map';

declare namespace pTimes {
	type Options = PMapOptions;
}

declare const pTimes: {
	/**
	Run promise-returning & async functions a specific number of times concurrently.

	@param count - Number of times to call `mapper`.
	@param mapper - Expected to return a `Promise` or value.
	@returns Fulfills when all promises returned from `mapper` are fulfilled, or rejects if any of the promises reject. The fulfilled value is an `Array` of the fulfilled values returned from `mapper` in order.

	@example
	```
	import pTimes = require('p-times');

	(async () => {
		const result = await pTimes(5, i => createFixture(`🦄-${i + 1}`));

		console.log(`Created fixtures: ${result.join(' ')}`);
		//=> 'Created fixtures: 🦄-1 🦄-2 🦄-3 🦄-4 🦄-5'
	})();
	```
	*/
	<ValueType>(
		count: number,
		mapper: (index: number) => ValueType | PromiseLike<ValueType>,
		options?: pTimes.Options
	): Promise<ValueType[]>;

	// TODO: Remove this for the next major release, refactor the whole definition to:
	// declare function pTimes<ValueType>(
	// 	count: number,
	// 	mapper: (index: number) => ValueType | PromiseLike<ValueType>,
	// 	options?: pTimes.Options
	// ): Promise<ValueType[]>;
	// export = pTimes;
	default: typeof pTimes;
};

export = pTimes;
