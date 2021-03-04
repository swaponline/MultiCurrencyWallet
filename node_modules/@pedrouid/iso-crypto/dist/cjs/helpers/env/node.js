"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeRipemd160 = exports.nodeSha512 = exports.nodeSha256 = exports.nodeHmacSha512Sign = exports.nodeHmacSha256Sign = exports.nodeAesDecrypt = exports.nodeAesEncrypt = void 0;
const crypto_1 = __importDefault(require("crypto"));
const enc_utils_1 = require("enc-utils");
const constants_1 = require("../constants");
function nodeAesEncrypt(iv, key, data) {
    const cipher = crypto_1.default.createCipheriv(constants_1.AES_NODE_ALGO, key, iv);
    return enc_utils_1.bufferToArray(enc_utils_1.concatBuffers(cipher.update(data), cipher.final()));
}
exports.nodeAesEncrypt = nodeAesEncrypt;
function nodeAesDecrypt(iv, key, data) {
    const decipher = crypto_1.default.createDecipheriv(constants_1.AES_NODE_ALGO, key, iv);
    return enc_utils_1.bufferToArray(enc_utils_1.concatBuffers(decipher.update(data), decipher.final()));
}
exports.nodeAesDecrypt = nodeAesDecrypt;
function nodeHmacSha256Sign(key, data) {
    const buf = crypto_1.default
        .createHmac(constants_1.HMAC_NODE_ALGO, new Uint8Array(key))
        .update(data)
        .digest();
    return enc_utils_1.bufferToArray(buf);
}
exports.nodeHmacSha256Sign = nodeHmacSha256Sign;
function nodeHmacSha512Sign(key, data) {
    const buf = crypto_1.default
        .createHmac(constants_1.SHA512_NODE_ALGO, new Uint8Array(key))
        .update(data)
        .digest();
    return enc_utils_1.bufferToArray(buf);
}
exports.nodeHmacSha512Sign = nodeHmacSha512Sign;
function nodeSha256(data) {
    const buf = crypto_1.default
        .createHash(constants_1.SHA256_NODE_ALGO)
        .update(data)
        .digest();
    return enc_utils_1.bufferToArray(buf);
}
exports.nodeSha256 = nodeSha256;
function nodeSha512(data) {
    const buf = crypto_1.default
        .createHash(constants_1.SHA512_NODE_ALGO)
        .update(data)
        .digest();
    return enc_utils_1.bufferToArray(buf);
}
exports.nodeSha512 = nodeSha512;
function nodeRipemd160(data) {
    const buf = crypto_1.default
        .createHash(constants_1.RIPEMD160_NODE_ALGO)
        .update(data)
        .digest();
    return enc_utils_1.bufferToArray(buf);
}
exports.nodeRipemd160 = nodeRipemd160;
//# sourceMappingURL=node.js.map