'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const combiner_1 = require('./combiner');
const parser_1 = require('./parser');
const typeFields_1 = require('./typeFields');
const utils_1 = require('./utils');
class Psbt {
  constructor(tx) {
    this.inputs = [];
    this.outputs = [];
    this.globalMap = {
      unsignedTx: tx,
    };
  }
  static fromBase64(data, txFromBuffer) {
    const buffer = Buffer.from(data, 'base64');
    return this.fromBuffer(buffer, txFromBuffer);
  }
  static fromHex(data, txFromBuffer) {
    const buffer = Buffer.from(data, 'hex');
    return this.fromBuffer(buffer, txFromBuffer);
  }
  static fromBuffer(buffer, txFromBuffer) {
    const results = parser_1.psbtFromBuffer(buffer, txFromBuffer);
    const psbt = new this(results.globalMap.unsignedTx);
    Object.assign(psbt, results);
    return psbt;
  }
  toBase64() {
    const buffer = this.toBuffer();
    return buffer.toString('base64');
  }
  toHex() {
    const buffer = this.toBuffer();
    return buffer.toString('hex');
  }
  toBuffer() {
    return parser_1.psbtToBuffer(this);
  }
  updateGlobal(updateData) {
    utils_1.updateGlobal(updateData, this.globalMap);
    return this;
  }
  updateInput(inputIndex, updateData) {
    const input = utils_1.checkForInput(this.inputs, inputIndex);
    utils_1.updateInput(updateData, input);
    return this;
  }
  updateOutput(outputIndex, updateData) {
    const output = utils_1.checkForOutput(this.outputs, outputIndex);
    utils_1.updateOutput(updateData, output);
    return this;
  }
  addUnknownKeyValToGlobal(keyVal) {
    utils_1.checkHasKey(
      keyVal,
      this.globalMap.unknownKeyVals,
      utils_1.getEnumLength(typeFields_1.GlobalTypes),
    );
    if (!this.globalMap.unknownKeyVals) this.globalMap.unknownKeyVals = [];
    this.globalMap.unknownKeyVals.push(keyVal);
    return this;
  }
  addUnknownKeyValToInput(inputIndex, keyVal) {
    const input = utils_1.checkForInput(this.inputs, inputIndex);
    utils_1.checkHasKey(
      keyVal,
      input.unknownKeyVals,
      utils_1.getEnumLength(typeFields_1.InputTypes),
    );
    if (!input.unknownKeyVals) input.unknownKeyVals = [];
    input.unknownKeyVals.push(keyVal);
    return this;
  }
  addUnknownKeyValToOutput(outputIndex, keyVal) {
    const output = utils_1.checkForOutput(this.outputs, outputIndex);
    utils_1.checkHasKey(
      keyVal,
      output.unknownKeyVals,
      utils_1.getEnumLength(typeFields_1.OutputTypes),
    );
    if (!output.unknownKeyVals) output.unknownKeyVals = [];
    output.unknownKeyVals.push(keyVal);
    return this;
  }
  addInput(inputData) {
    this.globalMap.unsignedTx.addInput(inputData);
    this.inputs.push({
      unknownKeyVals: [],
    });
    const addKeyVals = inputData.unknownKeyVals || [];
    const inputIndex = this.inputs.length - 1;
    if (!Array.isArray(addKeyVals)) {
      throw new Error('unknownKeyVals must be an Array');
    }
    addKeyVals.forEach(keyVal =>
      this.addUnknownKeyValToInput(inputIndex, keyVal),
    );
    utils_1.addInputAttributes(this.inputs, inputData);
    return this;
  }
  addOutput(outputData) {
    this.globalMap.unsignedTx.addOutput(outputData);
    this.outputs.push({
      unknownKeyVals: [],
    });
    const addKeyVals = outputData.unknownKeyVals || [];
    const outputIndex = this.outputs.length - 1;
    if (!Array.isArray(addKeyVals)) {
      throw new Error('unknownKeyVals must be an Array');
    }
    addKeyVals.forEach(keyVal =>
      this.addUnknownKeyValToInput(outputIndex, keyVal),
    );
    utils_1.addOutputAttributes(this.outputs, outputData);
    return this;
  }
  clearFinalizedInput(inputIndex) {
    const input = utils_1.checkForInput(this.inputs, inputIndex);
    utils_1.inputCheckUncleanFinalized(inputIndex, input);
    for (const key of Object.keys(input)) {
      if (
        ![
          'witnessUtxo',
          'nonWitnessUtxo',
          'finalScriptSig',
          'finalScriptWitness',
          'unknownKeyVals',
        ].includes(key)
      ) {
        // @ts-ignore
        delete input[key];
      }
    }
    return this;
  }
  combine(...those) {
    // Combine this with those.
    // Return self for chaining.
    const result = combiner_1.combine([this].concat(those));
    Object.assign(this, result);
    return this;
  }
  getTransaction() {
    return this.globalMap.unsignedTx.toBuffer();
  }
}
exports.Psbt = Psbt;
