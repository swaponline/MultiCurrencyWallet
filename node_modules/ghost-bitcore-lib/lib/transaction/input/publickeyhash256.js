'use strict';

var inherits = require('inherits');

var $ = require('../../util/preconditions');
var BufferUtil = require('../../util/buffer');

var Hash = require('../../crypto/hash');
var Input = require('./input');
var Output = require('../output');
var Sighash = require('../sighash');
var Script = require('../../script');
var Signature = require('../../crypto/signature');
var TransactionSignature = require('../signature');

/**
 * Represents a special kind of input of PayToPublicKeyHash kind.
 * @constructor
 */
function PublicKeyHash256Input() {
  Input.apply(this, arguments);
}
inherits(PublicKeyHash256Input, Input);

/* jshint maxparams: 5 */
/**
 * @param {Transaction} transaction - the transaction to be signed
 * @param {PrivateKey} privateKey - the private key with which to sign the transaction
 * @param {number} index - the index of the input in the transaction input vector
 * @param {number=} sigtype - the type of signature, defaults to Signature.SIGHASH_ALL
 * @param {Buffer=} hashData - the precalculated hash of the public key associated with the privateKey provided
 * @return {Array} of objects that can be
 */
PublicKeyHash256Input.prototype.getSignatures = function(transaction, privateKey, index, sigtype, hashData) {
  $.checkState(this.output instanceof Output);
  hashData = hashData || Hash.sha256(privateKey.publicKey.toBuffer());
  sigtype = sigtype || Signature.SIGHASH_ALL;

  if (BufferUtil.equals(hashData, this.output.script.getPublicKeyHash256())) {
    return [new TransactionSignature({
      publicKey: privateKey.publicKey,
      prevTxId: this.prevTxId,
      outputIndex: this.outputIndex,
      inputIndex: index,
      signature: Sighash.sign(transaction, privateKey, sigtype, index, this.output.script),
      sigtype: sigtype
    })];
  }
  return [];
};
/* jshint maxparams: 3 */

/**
 * Add the provided signature
 *
 * @param {Object} signature
 * @param {PublicKey} signature.publicKey
 * @param {Signature} signature.signature
 * @param {number=} signature.sigtype
 * @return {PublicKeyHash256Input} this, for chaining
 */
PublicKeyHash256Input.prototype.addSignature = function(transaction, signature) {
  $.checkState(this.isValidSignature(transaction, signature), 'Signature is invalid');

  this.setWitnesses([
    BufferUtil.concat([
      signature.signature.toDER(),
      BufferUtil.integerAsSingleByteBuffer(signature.sigtype)
    ]),
    signature.publicKey.toBuffer()
  ]);

  return this;
};

/**
 * Clear the input's signature
 * @return {PublicKeyHash256Input} this, for chaining
 */
PublicKeyHash256Input.prototype.clearSignatures = function() {
  this.setWitnesses([]);

  return this;
};

/**
 * Query whether the input is signed
 * @return {boolean}
 */
PublicKeyHash256Input.prototype.isFullySigned = function() {
  return this.script.isPublicKeyHashIn();
};

PublicKeyHash256Input.SCRIPT_MAX_SIZE = 73 + 34; // sigsize (1 + 72) + pubkey (1 + 33)

PublicKeyHash256Input.prototype._estimateSize = function() {
  return PublicKeyHash256Input.SCRIPT_MAX_SIZE;
};

module.exports = PublicKeyHash256Input;
