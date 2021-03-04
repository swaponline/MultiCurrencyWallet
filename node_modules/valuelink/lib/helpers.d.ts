/**
 * Select appropriate helpers function for particular value type.
 */
export interface IterableLink {
    value: any;
    at(key: number | string): any;
}
export declare type Iterator = (link: any, key: string | number) => any;
export interface Helper {
    map(link: IterableLink, iterator: Iterator): any[];
    clone(obj: any): any;
    remove(obj: any, key: string | number): any;
}
export declare function helpers(value: any): Helper;
export declare const objectHelpers: Helper;
export declare const arrayHelpers: Helper;
