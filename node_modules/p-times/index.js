'use strict';
const pMap = require('p-map');

const pTimes = async (count, mapper, options) =>
	pMap(new Array(count).fill(), (element, index) => mapper(index), options);

module.exports = pTimes;
// TODO: Remove this for the next major release
module.exports.default = pTimes;
