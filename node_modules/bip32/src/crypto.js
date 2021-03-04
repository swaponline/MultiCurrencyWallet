"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createHash = require('create-hash');
const createHmac = require('create-hmac');
function hash160(buffer) {
    const sha256Hash = createHash('sha256')
        .update(buffer)
        .digest();
    try {
        return createHash('rmd160')
            .update(sha256Hash)
            .digest();
    }
    catch (err) {
        return createHash('ripemd160')
            .update(sha256Hash)
            .digest();
    }
}
exports.hash160 = hash160;
function hmacSHA512(key, data) {
    return createHmac('sha512', key)
        .update(data)
        .digest();
}
exports.hmacSHA512 = hmacSHA512;
