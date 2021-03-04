"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ripemd160Sync = exports.sha512Sync = exports.sha256Sync = void 0;
const helpers_1 = require("../helpers");
function sha256Sync(msg) {
    let result = helpers_1.EMPTY_UINT_ARRAY;
    if (helpers_1.isNode()) {
        result = helpers_1.nodeSha256(msg);
    }
    else {
        result = helpers_1.fallbackSha256(msg);
    }
    return result;
}
exports.sha256Sync = sha256Sync;
function sha512Sync(msg) {
    let result = helpers_1.EMPTY_UINT_ARRAY;
    if (helpers_1.isNode()) {
        result = helpers_1.nodeSha512(msg);
    }
    else {
        result = helpers_1.fallbackSha512(msg);
    }
    return result;
}
exports.sha512Sync = sha512Sync;
function ripemd160Sync(msg) {
    let result = helpers_1.EMPTY_UINT_ARRAY;
    if (helpers_1.isNode()) {
        result = helpers_1.nodeRipemd160(msg);
    }
    else {
        result = helpers_1.fallbackRipemd160(msg);
    }
    return result;
}
exports.ripemd160Sync = ripemd160Sync;
//# sourceMappingURL=sync.js.map