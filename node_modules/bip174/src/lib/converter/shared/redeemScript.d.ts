import { KeyValue, RedeemScript } from '../../interfaces';
export declare function makeConverter(TYPE_BYTE: number): {
    decode: (keyVal: KeyValue) => RedeemScript;
    encode: (data: RedeemScript) => KeyValue;
    check: (data: any) => data is RedeemScript;
    expected: string;
    canAdd: (currentData: any, newData: any) => boolean;
};
