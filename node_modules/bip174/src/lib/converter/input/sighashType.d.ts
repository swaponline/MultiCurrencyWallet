import { KeyValue, SighashType } from '../../interfaces';
export declare function decode(keyVal: KeyValue): SighashType;
export declare function encode(data: SighashType): KeyValue;
export declare const expected = "number";
export declare function check(data: any): data is SighashType;
export declare function canAdd(currentData: any, newData: any): boolean;
