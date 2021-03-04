/// <reference types="node" />
import { KeyValue, PsbtGlobal, PsbtGlobalUpdate, PsbtInput, PsbtInputExtended, PsbtInputUpdate, PsbtOutput, PsbtOutputExtended, PsbtOutputUpdate, Transaction, TransactionFromBuffer } from './interfaces';
export declare class Psbt {
    static fromBase64<T extends typeof Psbt>(this: T, data: string, txFromBuffer: TransactionFromBuffer): InstanceType<T>;
    static fromHex<T extends typeof Psbt>(this: T, data: string, txFromBuffer: TransactionFromBuffer): InstanceType<T>;
    static fromBuffer<T extends typeof Psbt>(this: T, buffer: Buffer, txFromBuffer: TransactionFromBuffer): InstanceType<T>;
    readonly inputs: PsbtInput[];
    readonly outputs: PsbtOutput[];
    readonly globalMap: PsbtGlobal;
    constructor(tx: Transaction);
    toBase64(): string;
    toHex(): string;
    toBuffer(): Buffer;
    updateGlobal(updateData: PsbtGlobalUpdate): this;
    updateInput(inputIndex: number, updateData: PsbtInputUpdate): this;
    updateOutput(outputIndex: number, updateData: PsbtOutputUpdate): this;
    addUnknownKeyValToGlobal(keyVal: KeyValue): this;
    addUnknownKeyValToInput(inputIndex: number, keyVal: KeyValue): this;
    addUnknownKeyValToOutput(outputIndex: number, keyVal: KeyValue): this;
    addInput(inputData: PsbtInputExtended): this;
    addOutput(outputData: PsbtOutputExtended): this;
    clearFinalizedInput(inputIndex: number): this;
    combine(...those: this[]): this;
    getTransaction(): Buffer;
}
