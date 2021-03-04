"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hmacSha512VerifySync = exports.hmacSha512SignSync = exports.hmacSha256VerifySync = exports.hmacSha256SignSync = void 0;
const helpers_1 = require("../helpers");
function hmacSha256SignSync(key, msg) {
    let result;
    if (helpers_1.isNode()) {
        result = helpers_1.nodeHmacSha256Sign(key, msg);
    }
    else {
        result = helpers_1.fallbackHmacSha256Sign(key, msg);
    }
    return result;
}
exports.hmacSha256SignSync = hmacSha256SignSync;
function hmacSha256VerifySync(key, msg, sig) {
    let result;
    if (helpers_1.isNode()) {
        const expectedSig = helpers_1.nodeHmacSha256Sign(key, msg);
        result = helpers_1.isConstantTime(expectedSig, sig);
    }
    else {
        const expectedSig = helpers_1.fallbackHmacSha256Sign(key, msg);
        result = helpers_1.isConstantTime(expectedSig, sig);
    }
    return result;
}
exports.hmacSha256VerifySync = hmacSha256VerifySync;
function hmacSha512SignSync(key, msg) {
    let result;
    if (helpers_1.isNode()) {
        result = helpers_1.nodeHmacSha512Sign(key, msg);
    }
    else {
        result = helpers_1.fallbackHmacSha512Sign(key, msg);
    }
    return result;
}
exports.hmacSha512SignSync = hmacSha512SignSync;
function hmacSha512VerifySync(key, msg, sig) {
    let result;
    if (helpers_1.isNode()) {
        const expectedSig = helpers_1.nodeHmacSha512Sign(key, msg);
        result = helpers_1.isConstantTime(expectedSig, sig);
    }
    else {
        const expectedSig = helpers_1.fallbackHmacSha512Sign(key, msg);
        result = helpers_1.isConstantTime(expectedSig, sig);
    }
    return result;
}
exports.hmacSha512VerifySync = hmacSha512VerifySync;
//# sourceMappingURL=sync.js.map