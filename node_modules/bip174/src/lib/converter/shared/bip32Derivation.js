'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const range = n => [...Array(n).keys()];
function makeConverter(TYPE_BYTE) {
  function decode(keyVal) {
    if (keyVal.key[0] !== TYPE_BYTE) {
      throw new Error(
        'Decode Error: could not decode bip32Derivation with key 0x' +
          keyVal.key.toString('hex'),
      );
    }
    if (
      !(keyVal.key.length === 34 || keyVal.key.length === 66) ||
      ![2, 3, 4].includes(keyVal.key[1])
    ) {
      throw new Error(
        'Decode Error: bip32Derivation has invalid pubkey in key 0x' +
          keyVal.key.toString('hex'),
      );
    }
    if ((keyVal.value.length / 4) % 1 !== 0) {
      throw new Error(
        'Decode Error: Input BIP32_DERIVATION value length should be multiple of 4',
      );
    }
    const pubkey = keyVal.key.slice(1);
    const data = {
      masterFingerprint: keyVal.value.slice(0, 4),
      pubkey,
      path: 'm',
    };
    for (const i of range(keyVal.value.length / 4 - 1)) {
      const val = keyVal.value.readUInt32LE(i * 4 + 4);
      const isHard = !!(val & 0x80000000);
      const idx = val & 0x7fffffff;
      data.path += '/' + idx.toString(10) + (isHard ? "'" : '');
    }
    return data;
  }
  function encode(data) {
    const head = Buffer.from([TYPE_BYTE]);
    const key = Buffer.concat([head, data.pubkey]);
    const splitPath = data.path.split('/');
    const value = Buffer.allocUnsafe(splitPath.length * 4);
    data.masterFingerprint.copy(value, 0);
    let offset = 4;
    splitPath.slice(1).forEach(level => {
      const isHard = level.slice(-1) === "'";
      let num = 0x7fffffff & parseInt(isHard ? level.slice(0, -1) : level, 10);
      if (isHard) num += 0x80000000;
      value.writeUInt32LE(num, offset);
      offset += 4;
    });
    return {
      key,
      value,
    };
  }
  const expected =
    '{ masterFingerprint: Buffer; pubkey: Buffer; path: string; }';
  function check(data) {
    return (
      Buffer.isBuffer(data.pubkey) &&
      Buffer.isBuffer(data.masterFingerprint) &&
      typeof data.path === 'string' &&
      [33, 65].includes(data.pubkey.length) &&
      [2, 3, 4].includes(data.pubkey[0]) &&
      data.masterFingerprint.length === 4
    );
  }
  function canAddToArray(array, item, dupeSet) {
    const dupeString = item.pubkey.toString('hex');
    if (dupeSet.has(dupeString)) return false;
    dupeSet.add(dupeString);
    return array.filter(v => v.pubkey.equals(item.pubkey)).length === 0;
  }
  return {
    decode,
    encode,
    check,
    expected,
    canAddToArray,
  };
}
exports.makeConverter = makeConverter;
