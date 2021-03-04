"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decode2 = exports.decode1 = exports.decode0 = exports.encode2 = exports.encode1 = exports.encode0 = exports.uint16BEDecode = exports.uint16BEEncode = void 0;
const buffer_1 = require("buffer");
const uint16BEEncode = (value, target, offset) => {
    target = target || buffer_1.Buffer.allocUnsafe(2);
    target.writeUInt16BE(value, offset);
    return target;
};
exports.uint16BEEncode = uint16BEEncode;
exports.uint16BEEncode.bytes = 2;
const uint16BEDecode = (data) => {
    if (data.length < 2)
        throw RangeError('Could not decode int16BE');
    return data.readUInt16BE(0);
};
exports.uint16BEDecode = uint16BEDecode;
exports.uint16BEDecode.bytes = 2;
// Note: IK and XX encoder usage is opposite (XX uses in stages encode0 where IK uses encode1)
function encode0(message) {
    return buffer_1.Buffer.concat([message.ne, message.ciphertext]);
}
exports.encode0 = encode0;
function encode1(message) {
    return buffer_1.Buffer.concat([message.ne, message.ns, message.ciphertext]);
}
exports.encode1 = encode1;
function encode2(message) {
    return buffer_1.Buffer.concat([message.ns, message.ciphertext]);
}
exports.encode2 = encode2;
function decode0(input) {
    if (input.length < 32) {
        throw new Error('Cannot decode stage 0 MessageBuffer: length less than 32 bytes.');
    }
    return {
        ne: input.slice(0, 32),
        ciphertext: input.slice(32, input.length),
        ns: buffer_1.Buffer.alloc(0)
    };
}
exports.decode0 = decode0;
function decode1(input) {
    if (input.length < 80) {
        throw new Error('Cannot decode stage 1 MessageBuffer: length less than 80 bytes.');
    }
    return {
        ne: input.slice(0, 32),
        ns: input.slice(32, 80),
        ciphertext: input.slice(80, input.length)
    };
}
exports.decode1 = decode1;
function decode2(input) {
    if (input.length < 48) {
        throw new Error('Cannot decode stage 2 MessageBuffer: length less than 48 bytes.');
    }
    return {
        ne: buffer_1.Buffer.alloc(0),
        ns: input.slice(0, 48),
        ciphertext: input.slice(48, input.length)
    };
}
exports.decode2 = decode2;
//# sourceMappingURL=encoder.js.map