import { FinalScriptWitness, KeyValue } from '../../interfaces';
export declare function decode(keyVal: KeyValue): FinalScriptWitness;
export declare function encode(data: FinalScriptWitness): KeyValue;
export declare const expected = "Buffer";
export declare function check(data: any): data is FinalScriptWitness;
export declare function canAdd(currentData: any, newData: any): boolean;
