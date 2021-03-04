'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
// Number.MAX_SAFE_INTEGER
const MAX_SAFE_INTEGER = 9007199254740991;
function checkUInt53(n) {
  if (n < 0 || n > MAX_SAFE_INTEGER || n % 1 !== 0)
    throw new RangeError('value out of range');
}
function encode(_number, buffer, offset) {
  checkUInt53(_number);
  if (!buffer) buffer = Buffer.allocUnsafe(encodingLength(_number));
  if (!Buffer.isBuffer(buffer))
    throw new TypeError('buffer must be a Buffer instance');
  if (!offset) offset = 0;
  // 8 bit
  if (_number < 0xfd) {
    buffer.writeUInt8(_number, offset);
    Object.assign(encode, { bytes: 1 });
    // 16 bit
  } else if (_number <= 0xffff) {
    buffer.writeUInt8(0xfd, offset);
    buffer.writeUInt16LE(_number, offset + 1);
    Object.assign(encode, { bytes: 3 });
    // 32 bit
  } else if (_number <= 0xffffffff) {
    buffer.writeUInt8(0xfe, offset);
    buffer.writeUInt32LE(_number, offset + 1);
    Object.assign(encode, { bytes: 5 });
    // 64 bit
  } else {
    buffer.writeUInt8(0xff, offset);
    buffer.writeUInt32LE(_number >>> 0, offset + 1);
    buffer.writeUInt32LE((_number / 0x100000000) | 0, offset + 5);
    Object.assign(encode, { bytes: 9 });
  }
  return buffer;
}
exports.encode = encode;
function decode(buffer, offset) {
  if (!Buffer.isBuffer(buffer))
    throw new TypeError('buffer must be a Buffer instance');
  if (!offset) offset = 0;
  const first = buffer.readUInt8(offset);
  // 8 bit
  if (first < 0xfd) {
    Object.assign(decode, { bytes: 1 });
    return first;
    // 16 bit
  } else if (first === 0xfd) {
    Object.assign(decode, { bytes: 3 });
    return buffer.readUInt16LE(offset + 1);
    // 32 bit
  } else if (first === 0xfe) {
    Object.assign(decode, { bytes: 5 });
    return buffer.readUInt32LE(offset + 1);
    // 64 bit
  } else {
    Object.assign(decode, { bytes: 9 });
    const lo = buffer.readUInt32LE(offset + 1);
    const hi = buffer.readUInt32LE(offset + 5);
    const _number = hi * 0x0100000000 + lo;
    checkUInt53(_number);
    return _number;
  }
}
exports.decode = decode;
function encodingLength(_number) {
  checkUInt53(_number);
  return _number < 0xfd
    ? 1
    : _number <= 0xffff
    ? 3
    : _number <= 0xffffffff
    ? 5
    : 9;
}
exports.encodingLength = encodingLength;
