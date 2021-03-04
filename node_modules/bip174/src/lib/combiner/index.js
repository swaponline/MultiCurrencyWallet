'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const parser_1 = require('../parser');
function combine(psbts) {
  const self = psbts[0];
  const selfKeyVals = parser_1.psbtToKeyVals(self);
  const others = psbts.slice(1);
  if (others.length === 0) throw new Error('Combine: Nothing to combine');
  const selfTx = getTx(self);
  if (selfTx === undefined) {
    throw new Error('Combine: Self missing transaction');
  }
  const selfGlobalSet = getKeySet(selfKeyVals.globalKeyVals);
  const selfInputSets = selfKeyVals.inputKeyVals.map(getKeySet);
  const selfOutputSets = selfKeyVals.outputKeyVals.map(getKeySet);
  for (const other of others) {
    const otherTx = getTx(other);
    if (
      otherTx === undefined ||
      !otherTx.toBuffer().equals(selfTx.toBuffer())
    ) {
      throw new Error(
        'Combine: One of the Psbts does not have the same transaction.',
      );
    }
    const otherKeyVals = parser_1.psbtToKeyVals(other);
    const otherGlobalSet = getKeySet(otherKeyVals.globalKeyVals);
    otherGlobalSet.forEach(
      keyPusher(
        selfGlobalSet,
        selfKeyVals.globalKeyVals,
        otherKeyVals.globalKeyVals,
      ),
    );
    const otherInputSets = otherKeyVals.inputKeyVals.map(getKeySet);
    otherInputSets.forEach((inputSet, idx) =>
      inputSet.forEach(
        keyPusher(
          selfInputSets[idx],
          selfKeyVals.inputKeyVals[idx],
          otherKeyVals.inputKeyVals[idx],
        ),
      ),
    );
    const otherOutputSets = otherKeyVals.outputKeyVals.map(getKeySet);
    otherOutputSets.forEach((outputSet, idx) =>
      outputSet.forEach(
        keyPusher(
          selfOutputSets[idx],
          selfKeyVals.outputKeyVals[idx],
          otherKeyVals.outputKeyVals[idx],
        ),
      ),
    );
  }
  return parser_1.psbtFromKeyVals(selfTx, {
    globalMapKeyVals: selfKeyVals.globalKeyVals,
    inputKeyVals: selfKeyVals.inputKeyVals,
    outputKeyVals: selfKeyVals.outputKeyVals,
  });
}
exports.combine = combine;
function keyPusher(selfSet, selfKeyVals, otherKeyVals) {
  return key => {
    if (selfSet.has(key)) return;
    const newKv = otherKeyVals.filter(kv => kv.key.toString('hex') === key)[0];
    selfKeyVals.push(newKv);
    selfSet.add(key);
  };
}
function getTx(psbt) {
  return psbt.globalMap.unsignedTx;
}
function getKeySet(keyVals) {
  const set = new Set();
  keyVals.forEach(keyVal => {
    const hex = keyVal.key.toString('hex');
    if (set.has(hex))
      throw new Error('Combine: KeyValue Map keys should be unique');
    set.add(hex);
  });
  return set;
}
