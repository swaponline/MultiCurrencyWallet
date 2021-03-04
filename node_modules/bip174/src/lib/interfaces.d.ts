/// <reference types="node" />
export declare type TransactionFromBuffer = (buffer: Buffer) => Transaction;
export interface Transaction {
    getInputOutputCounts(): {
        inputCount: number;
        outputCount: number;
    };
    addInput(objectArg: any): void;
    addOutput(objectArg: any): void;
    toBuffer(): Buffer;
}
export interface KeyValue {
    key: Buffer;
    value: Buffer;
}
export interface PsbtGlobal extends PsbtGlobalUpdate {
    unsignedTx: Transaction;
    unknownKeyVals?: KeyValue[];
}
export interface PsbtGlobalUpdate {
    globalXpub?: GlobalXpub[];
}
export interface PsbtInput extends PsbtInputUpdate {
    unknownKeyVals?: KeyValue[];
}
export interface PsbtInputUpdate {
    partialSig?: PartialSig[];
    nonWitnessUtxo?: NonWitnessUtxo;
    witnessUtxo?: WitnessUtxo;
    sighashType?: SighashType;
    redeemScript?: RedeemScript;
    witnessScript?: WitnessScript;
    bip32Derivation?: Bip32Derivation[];
    finalScriptSig?: FinalScriptSig;
    finalScriptWitness?: FinalScriptWitness;
    porCommitment?: PorCommitment;
}
export interface PsbtInputExtended extends PsbtInput {
    [index: string]: any;
}
export interface PsbtOutput extends PsbtOutputUpdate {
    unknownKeyVals?: KeyValue[];
}
export interface PsbtOutputUpdate {
    redeemScript?: RedeemScript;
    witnessScript?: WitnessScript;
    bip32Derivation?: Bip32Derivation[];
}
export interface PsbtOutputExtended extends PsbtOutput {
    [index: string]: any;
}
export interface GlobalXpub {
    extendedPubkey: Buffer;
    masterFingerprint: Buffer;
    path: string;
}
export interface PartialSig {
    pubkey: Buffer;
    signature: Buffer;
}
export interface Bip32Derivation {
    masterFingerprint: Buffer;
    pubkey: Buffer;
    path: string;
}
export interface WitnessUtxo {
    script: Buffer;
    value: number;
}
export declare type NonWitnessUtxo = Buffer;
export declare type SighashType = number;
export declare type RedeemScript = Buffer;
export declare type WitnessScript = Buffer;
export declare type FinalScriptSig = Buffer;
export declare type FinalScriptWitness = Buffer;
export declare type PorCommitment = string;
export declare type TransactionIOCountGetter = (txBuffer: Buffer) => {
    inputCount: number;
    outputCount: number;
};
export interface TransactionInput {
    hash: string | Buffer;
    index: number;
    sequence?: number;
}
export declare type TransactionInputAdder = (input: TransactionInput, txBuffer: Buffer) => Buffer;
export interface TransactionOutput {
    script: Buffer;
    value: number;
}
export declare type TransactionOutputAdder = (output: TransactionOutput, txBuffer: Buffer) => Buffer;
export declare type TransactionVersionSetter = (version: number, txBuffer: Buffer) => Buffer;
export declare type TransactionLocktimeSetter = (locktime: number, txBuffer: Buffer) => Buffer;
