/// <reference types="node" />
import { KeyValue, PsbtGlobal, PsbtGlobalUpdate, PsbtInput, PsbtInputUpdate, PsbtOutput, PsbtOutputUpdate } from './interfaces';
export declare function checkForInput(inputs: PsbtInput[], inputIndex: number): PsbtInput;
export declare function checkForOutput(outputs: PsbtOutput[], outputIndex: number): PsbtOutput;
export declare function checkHasKey(checkKeyVal: KeyValue, keyVals: KeyValue[] | undefined, enumLength: number): void;
export declare function getEnumLength(myenum: any): number;
export declare function inputCheckUncleanFinalized(inputIndex: number, input: PsbtInput): void;
export declare const updateGlobal: (updateData: PsbtGlobalUpdate, mainData: PsbtGlobal) => void;
export declare const updateInput: (updateData: PsbtInputUpdate, mainData: PsbtInput) => void;
export declare const updateOutput: (updateData: PsbtOutputUpdate, mainData: PsbtOutput) => void;
export declare function addInputAttributes(inputs: PsbtInput[], data: any): void;
export declare function addOutputAttributes(outputs: PsbtOutput[], data: any): void;
export declare function defaultVersionSetter(version: number, txBuf: Buffer): Buffer;
export declare function defaultLocktimeSetter(locktime: number, txBuf: Buffer): Buffer;
