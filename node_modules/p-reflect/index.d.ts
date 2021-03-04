declare namespace pReflect {
	interface PromiseFulfilledResult<ValueType> {
		isFulfilled: true;
		isRejected: false;
		value: ValueType;
	}

	interface PromiseRejectedResult {
		isFulfilled: false;
		isRejected: true;
		reason: unknown;
	}

	type PromiseResult<ValueType> =
		| PromiseFulfilledResult<ValueType>
		| PromiseRejectedResult;
}

declare const pReflect: {
	/**
	Make a promise always fulfill with its actual fulfillment value or rejection reason.

	@param promise - A promise to reflect upon.
	@returns Promise reflection.

	@example
	```
	import pReflect = require('p-reflect');

	// Here, `Promise.all` would normally fail early because one of the promises rejects, but by using `p-reflect`, we can ignore the rejection and handle it later on.

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
		*\/

		const resolvedString = results
			.filter(result => result.isFulfilled)
			.map(result => result.value)
			.join('');

		console.log(resolvedString);
		//=> '🦄🐴'
	})();
	```
	*/
	<ValueType>(promise: PromiseLike<ValueType>): Promise<
		pReflect.PromiseResult<ValueType>
	>;

	// TODO: Remove this for the next major release, refactor the whole definition to:
	// declare function pReflect<ValueType>(
	// 	promise: PromiseLike<ValueType>
	// ): Promise<pReflect.PromiseResult<ValueType>>;
	// export = pReflect;
	default: typeof pReflect;
};

export = pReflect;
