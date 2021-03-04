import { KeyValue, WitnessScript } from '../../interfaces';
export declare function makeConverter(TYPE_BYTE: number): {
    decode: (keyVal: KeyValue) => WitnessScript;
    encode: (data: WitnessScript) => KeyValue;
    check: (data: any) => data is WitnessScript;
    expected: string;
    canAdd: (currentData: any, newData: any) => boolean;
};
