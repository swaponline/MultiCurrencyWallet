"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aesCbcDecryptSync = exports.aesCbcEncryptSync = void 0;
const helpers_1 = require("../helpers");
function aesCbcEncryptSync(iv, key, data) {
    let result;
    if (helpers_1.isNode()) {
        result = helpers_1.nodeAesEncrypt(iv, key, data);
    }
    else {
        result = helpers_1.fallbackAesEncrypt(iv, key, data);
    }
    return result;
}
exports.aesCbcEncryptSync = aesCbcEncryptSync;
function aesCbcDecryptSync(iv, key, data) {
    let result;
    if (helpers_1.isNode()) {
        result = helpers_1.nodeAesDecrypt(iv, key, data);
    }
    else {
        result = helpers_1.fallbackAesDecrypt(iv, key, data);
    }
    return result;
}
exports.aesCbcDecryptSync = aesCbcDecryptSync;
//# sourceMappingURL=sync.js.map