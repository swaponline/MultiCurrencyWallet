'use strict';
const pSome = require('p-some');
const PCancelable = require('p-cancelable');

module.exports = (iterable, options) => {
	const anyCancelable = pSome(iterable, {...options, count: 1});

	return PCancelable.fn(async onCancel => {
		onCancel(() => {
			anyCancelable.cancel();
		});

		const [value] = await anyCancelable;
		return value;
	})();
};

module.exports.AggregateError = pSome.AggregateError;
