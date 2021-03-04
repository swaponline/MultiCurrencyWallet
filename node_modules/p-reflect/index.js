'use strict';

const pReflect = async promise => {
	try {
		const value = await promise;
		return {
			isFulfilled: true,
			isRejected: false,
			value
		};
	} catch (error) {
		return {
			isFulfilled: false,
			isRejected: true,
			reason: error
		};
	}
};

module.exports = pReflect;
// TODO: Remove this for the next major release
module.exports.default = pReflect;
