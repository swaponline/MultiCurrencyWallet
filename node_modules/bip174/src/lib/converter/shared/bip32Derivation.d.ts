import { Bip32Derivation, KeyValue } from '../../interfaces';
export declare function makeConverter(TYPE_BYTE: number): {
    decode: (keyVal: KeyValue) => Bip32Derivation;
    encode: (data: Bip32Derivation) => KeyValue;
    check: (data: any) => data is Bip32Derivation;
    expected: string;
    canAddToArray: (array: Bip32Derivation[], item: Bip32Derivation, dupeSet: Set<string>) => boolean;
};
