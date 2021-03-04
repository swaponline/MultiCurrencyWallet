export declare type ValidTypes = string | boolean | number | PlainObject;
export declare type Comparator = Array<string | any[]>;
export declare type Data = PlainObject | ValidTypes[];
export declare type Key = string | number;
export declare type KeyType<P, D> = P | D extends any[] ? Key : keyof P | keyof D;
export declare type PlainObject = Record<string, any>;
export declare type Value = ValidTypes | ValidTypes[];
export interface Options<T = Key> {
    actual?: Value;
    filter?: boolean;
    key?: T;
    previous?: Value;
    type?: 'decreased' | 'increased';
}
export interface CompareValuesOptions<T = Key> {
    key?: T;
    type: 'added' | 'removed';
    value?: Value;
}
export interface TreeChanges<K> {
    added: (key?: K, value?: Value) => boolean;
    changed: (key?: K | string, actual?: Value, previous?: Value) => boolean;
    changedFrom: (key: K | string, previous: Value, actual?: Value) => boolean;
    /**
     * @deprecated
     * Use "changed" instead.
     */
    changedTo: (key: K | string, actual: Value) => boolean;
    decreased: (key: K, actual?: Value, previous?: Value) => boolean;
    emptied: (key?: K) => boolean;
    filled: (key?: K) => boolean;
    increased: (key: K, actual?: Value, previous?: Value) => boolean;
    removed: (key?: K, value?: Value) => boolean;
}
