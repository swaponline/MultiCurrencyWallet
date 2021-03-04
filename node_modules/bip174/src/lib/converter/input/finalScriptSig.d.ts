import { FinalScriptSig, KeyValue } from '../../interfaces';
export declare function decode(keyVal: KeyValue): FinalScriptSig;
export declare function encode(data: FinalScriptSig): KeyValue;
export declare const expected = "Buffer";
export declare function check(data: any): data is FinalScriptSig;
export declare function canAdd(currentData: any, newData: any): boolean;
