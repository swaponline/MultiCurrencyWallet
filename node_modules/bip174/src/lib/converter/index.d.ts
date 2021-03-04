/// <reference types="node" />
import * as globalXpub from './global/globalXpub';
import * as unsignedTx from './global/unsignedTx';
import * as finalScriptSig from './input/finalScriptSig';
import * as finalScriptWitness from './input/finalScriptWitness';
import * as nonWitnessUtxo from './input/nonWitnessUtxo';
import * as partialSig from './input/partialSig';
import * as porCommitment from './input/porCommitment';
import * as sighashType from './input/sighashType';
import * as witnessUtxo from './input/witnessUtxo';
declare const globals: {
    unsignedTx: typeof unsignedTx;
    globalXpub: typeof globalXpub;
    checkPubkey: (keyVal: import("../interfaces").KeyValue) => Buffer | undefined;
};
declare const inputs: {
    nonWitnessUtxo: typeof nonWitnessUtxo;
    partialSig: typeof partialSig;
    sighashType: typeof sighashType;
    finalScriptSig: typeof finalScriptSig;
    finalScriptWitness: typeof finalScriptWitness;
    porCommitment: typeof porCommitment;
    witnessUtxo: typeof witnessUtxo;
    bip32Derivation: {
        decode: (keyVal: import("../interfaces").KeyValue) => import("../interfaces").Bip32Derivation;
        encode: (data: import("../interfaces").Bip32Derivation) => import("../interfaces").KeyValue;
        check: (data: any) => data is import("../interfaces").Bip32Derivation;
        expected: string;
        canAddToArray: (array: import("../interfaces").Bip32Derivation[], item: import("../interfaces").Bip32Derivation, dupeSet: Set<string>) => boolean;
    };
    redeemScript: {
        decode: (keyVal: import("../interfaces").KeyValue) => Buffer;
        encode: (data: Buffer) => import("../interfaces").KeyValue;
        check: (data: any) => data is Buffer;
        expected: string;
        canAdd: (currentData: any, newData: any) => boolean;
    };
    witnessScript: {
        decode: (keyVal: import("../interfaces").KeyValue) => Buffer;
        encode: (data: Buffer) => import("../interfaces").KeyValue;
        check: (data: any) => data is Buffer;
        expected: string;
        canAdd: (currentData: any, newData: any) => boolean;
    };
    checkPubkey: (keyVal: import("../interfaces").KeyValue) => Buffer | undefined;
};
declare const outputs: {
    bip32Derivation: {
        decode: (keyVal: import("../interfaces").KeyValue) => import("../interfaces").Bip32Derivation;
        encode: (data: import("../interfaces").Bip32Derivation) => import("../interfaces").KeyValue;
        check: (data: any) => data is import("../interfaces").Bip32Derivation;
        expected: string;
        canAddToArray: (array: import("../interfaces").Bip32Derivation[], item: import("../interfaces").Bip32Derivation, dupeSet: Set<string>) => boolean;
    };
    redeemScript: {
        decode: (keyVal: import("../interfaces").KeyValue) => Buffer;
        encode: (data: Buffer) => import("../interfaces").KeyValue;
        check: (data: any) => data is Buffer;
        expected: string;
        canAdd: (currentData: any, newData: any) => boolean;
    };
    witnessScript: {
        decode: (keyVal: import("../interfaces").KeyValue) => Buffer;
        encode: (data: Buffer) => import("../interfaces").KeyValue;
        check: (data: any) => data is Buffer;
        expected: string;
        canAdd: (currentData: any, newData: any) => boolean;
    };
    checkPubkey: (keyVal: import("../interfaces").KeyValue) => Buffer | undefined;
};
export { globals, inputs, outputs };
