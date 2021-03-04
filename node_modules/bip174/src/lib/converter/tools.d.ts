/// <reference types="node" />
import { KeyValue } from '../interfaces';
export declare const range: (n: number) => number[];
export declare function reverseBuffer(buffer: Buffer): Buffer;
export declare function keyValsToBuffer(keyVals: KeyValue[]): Buffer;
export declare function keyValToBuffer(keyVal: KeyValue): Buffer;
export declare function readUInt64LE(buffer: Buffer, offset: number): number;
export declare function writeUInt64LE(buffer: Buffer, value: number, offset: number): number;
