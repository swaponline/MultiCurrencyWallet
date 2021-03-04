import { KeyValue, WitnessUtxo } from '../../interfaces';
export declare function decode(keyVal: KeyValue): WitnessUtxo;
export declare function encode(data: WitnessUtxo): KeyValue;
export declare const expected = "{ script: Buffer; value: number; }";
export declare function check(data: any): data is WitnessUtxo;
export declare function canAdd(currentData: any, newData: any): boolean;
