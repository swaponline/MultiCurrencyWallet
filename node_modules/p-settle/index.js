'use strict';
const pReflect = require('p-reflect');
const pLimit = require('p-limit');

module.exports = async (array, options = {}) => {
	const {concurrency = Infinity} = options;
	const limit = pLimit(concurrency);

	return Promise.all(array.map(element => {
		if (element && typeof element.then === 'function') { // eslint-disable-line promise/prefer-await-to-then
			return pReflect(element);
		}

		if (typeof element === 'function') {
			return pReflect(limit(() => element()));
		}

		return pReflect(Promise.resolve(element));
	}));
};
