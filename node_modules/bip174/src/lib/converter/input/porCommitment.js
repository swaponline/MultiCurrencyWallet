'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const typeFields_1 = require('../../typeFields');
function decode(keyVal) {
  if (keyVal.key[0] !== typeFields_1.InputTypes.POR_COMMITMENT) {
    throw new Error(
      'Decode Error: could not decode porCommitment with key 0x' +
        keyVal.key.toString('hex'),
    );
  }
  return keyVal.value.toString('utf8');
}
exports.decode = decode;
function encode(data) {
  const key = Buffer.from([typeFields_1.InputTypes.POR_COMMITMENT]);
  return {
    key,
    value: Buffer.from(data, 'utf8'),
  };
}
exports.encode = encode;
exports.expected = 'string';
function check(data) {
  return typeof data === 'string';
}
exports.check = check;
function canAdd(currentData, newData) {
  return !!currentData && !!newData && currentData.porCommitment === undefined;
}
exports.canAdd = canAdd;
