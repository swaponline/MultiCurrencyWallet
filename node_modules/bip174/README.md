# bip174
[![Build Status](https://travis-ci.org/bitcoinjs/bip174.png?branch=master)](https://travis-ci.org/bitcoinjs/bip174)
[![NPM](https://img.shields.io/npm/v/bip174.svg)](https://www.npmjs.org/package/bip174)

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

A [BIP174](https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki) compatible partial Transaction encoding library.

## Bitcoin users, use bitcoinjs-lib's Psbt class.

This library is separate as an attempt to separate Bitcoin specific logic from the encoding format.

I apologize if this library is hard to use. Removing Bitcoin specific logic from "Partially Signed BITCOIN Transaction" format was kind of hard.

## Responsibilities Covered

1. Creator: You can create a new psbt and add inputs and outputs, then add extra info to the inputs using each individual method.
  (Note: Psbt.fromTransaction can create a PSBT from a serialized transaction, but all scriptSigs and witnessStacks must be empty,
    and the transaction should not have the segwit marker and flagbyte.)
2. Updater: You can add one of all types of the input and output information. Each function has strict type checking at runtime.
3. Combiner: using Psbt.combine(...Psbt[]), it will do a dumb merge gathering all the new key value pairs from the subsequent PSBTs into itself. The psbt calling `combine` has highest priority.

## Responsibilities NOT Covered

In order to keep this library as separate from Bitcoin logic as possible, This library will not implement the following responsibilities. But rather, down the road bitcoinjs-lib will adopt this class and extend it internally to allow for the following:

1. Signer: This class has no way to sign. You may add a PartialSig object though.
2. Extractor: This class has minimal knowledge of Bitcoin transactions, so creating a full transaction from a PSBT must be done with a bitcoin aware extended class.
3. Input Finalizer: This class, again, has no knowledge of whether an input is finished.

## Static methods and addInput / addOutput require an abstract Transaction object

* Static methods: You must pass a `TransactionFromBuffer` typed function. See `ts_src/lib/interfaces.ts` for info on the `Transaction` interface and the `TransactionFromBuffer` function.
* addInput/addOutput methods: The constructor takes a `Transaction` abstract interface that has an addInput/addOutput method which will be called.

## Example
```javascript
const { Psbt } = require('bip174')
const { PsbtTransaction , pTxFromBuffer } = require('./someImplementation')
// Psbt requires a Transaction interface to create an instance, as well as
// A function that turns a buffer into that interface. See Transaction and TransactionFromBuffer
// in ts_src/lib/interfaces.ts ...

// See tests/utils/txTools file for an example of a simple Bitcoin Transaction.
// Also see BitcoinJS-lib for an extended class that uses the Transaction class internally.
// Anyone using this library for Bitcoin specifically should use bitcoinjs-lib

// Your PsbtTransaction will have a toBuffer function to allow for serialization
const tx = pTxFromBuffer(someTransactionBuffer);
const psbt = new Psbt(tx)

// OR

// This will parse the PSBT, and use the function you pass to parse the Transaction part
// the function should throw if the scriptSig section is not empty
const psbt = Psbt.fromBuffer(somePsbtBuffer, pTxFromBuffer)

psbt.addInput({
  hash: '865dce988413971fd812d0e81a3395ed916a87ea533e1a16c0f4e15df96fa7d4',
  index: 3,
})
psbt.addInput({
  hash: 'ff5dce988413971fd812d0e81a3395ed916a87ea533e1a16c0f4e15df96fa7d4',
  index: 1,
})
psbt.addOutput({
  script: Buffer.from(
    'a914e18870f2c297fbfca54c5c6f645c7745a5b66eda87',
    'hex',
  ),
  value: 1234567890,
})
psbt.addOutput({
  script: Buffer.from(
    'a914e18870f2c297fbfca54c5c6f645c7745a5b66eda87',
    'hex',
  ),
  value: 987654321,
})
psbt.addRedeemScriptToInput(0, Buffer.from(
  '00208c2353173743b595dfb4a07b72ba8e42e3797da74e87fe7d9d7497e3b2028903',
  'hex',
))
psbt.addWitnessScriptToInput(0, Buffer.from(
  '522103089dc10c7ac6db54f91329af617333db388cead0c231f723379d1b9903' +
    '0b02dc21023add904f3d6dcf59ddb906b0dee23529b7ffb9ed50e5e861519268' +
    '60221f0e7352ae',
  'hex',
))
psbt.addBip32DerivationToInput(0, {
  masterFingerprint: Buffer.from('d90c6a4f', 'hex'),
  pubkey: Buffer.from(
    '023add904f3d6dcf59ddb906b0dee23529b7ffb9ed50e5e86151926860221f0e73',
    'hex',
  ),
  path: "m/0'/0'/3'",
})
psbt.addBip32DerivationToInput(0, {
  masterFingerprint: Buffer.from('d90c6a4f', 'hex'),
  pubkey: Buffer.from(
    '03089dc10c7ac6db54f91329af617333db388cead0c231f723379d1b99030b02dc',
    'hex',
  ),
  path: "m/0'/0'/2'",
})
const b64 = psbt.toBase64();
```

## LICENSE [MIT](LICENSE)
