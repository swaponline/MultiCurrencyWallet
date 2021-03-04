"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isConstantTime = exports.isNode = exports.isBrowser = exports.assert = void 0;
const env_1 = require("./env");
function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}
exports.assert = assert;
function isBrowser() {
    return !!env_1.getBrowerCrypto() && !!env_1.getSubtleCrypto();
}
exports.isBrowser = isBrowser;
function isNode() {
    return (typeof process !== 'undefined' &&
        typeof process.versions !== 'undefined' &&
        typeof process.versions.node !== 'undefined');
}
exports.isNode = isNode;
function isConstantTime(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    let res = 0;
    for (let i = 0; i < arr1.length; i++) {
        res |= arr1[i] ^ arr2[i];
    }
    return res === 0;
}
exports.isConstantTime = isConstantTime;
//# sourceMappingURL=validators.js.map