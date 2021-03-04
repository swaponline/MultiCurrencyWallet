/// <reference types="react" />
export declare type Transform<T> = (value: T, event?: {}) => T;
export declare type EventHandler = (event: {}) => void;
export interface Validator<T> {
    (value: T): boolean;
    error?: any;
}
export declare type LinksCache<S, X extends keyof S> = {
    [K in X]: Link<S[K]>;
};
export declare abstract class Link<T> {
    value: T;
    static state: <P, S, K extends keyof S>(component: React.Component<P, S>, key: K) => Link<S[K]>;
    static all: <P, S, K extends keyof S>(component: React.Component<P, S>, ..._keys: K[]) => LinksCache<S, K>;
    static value<T>(value: T, set: (x: T) => void): Link<T>;
    constructor(value: T);
    error: any;
    readonly validationError: any;
    abstract set(x: T): void;
    onChange(handler: (x: T) => void): Link<T>;
    readonly props: {
        checked: (T & false) | (T & true);
        onChange: (e: any) => void;
        value?: undefined;
    } | {
        value: T;
        onChange: (e: any) => void;
        checked?: undefined;
    };
    requestChange(x: T): void;
    update(transform: Transform<T>, e?: Object): void;
    pipe(handler: Transform<T>): Link<T>;
    action(transform: Transform<T>): EventHandler;
    equals(truthyValue: T): Link<boolean>;
    enabled(defaultValue?: T): Link<boolean>;
    contains<E>(this: Link<E[]>, element: E): Link<boolean>;
    push<E>(this: Link<E[]>, ...args: E[]): void;
    unshift<E>(this: Link<E[]>, ...args: E[]): void;
    splice(start: number, deleteCount?: number): any;
    map<E, Z>(this: Link<E[]>, iterator: (link: LinkAt<E, number>, idx: number) => Z): Z[];
    map<E, Z>(this: Link<{
        [key: string]: E;
    }>, iterator: (link: LinkAt<E, string>, idx: string) => Z): Z[];
    removeAt<E>(this: Link<E[]>, key: number): void;
    removeAt<E>(this: Link<{
        [key: string]: E;
    }>, key: string): void;
    at<E>(this: Link<E[]>, key: number): LinkAt<E, number>;
    at<K extends keyof T, E extends T[K]>(key: K): LinkAt<E, K>;
    clone(): T;
    pick<K extends keyof T>(...keys: K[]): {
        [P in K]: Link<T[P]>;
    };
    /**
     * Validate link with validness predicate and optional custom error object. Can be chained.
     */
    check(whenValid: Validator<T>, error?: any): this;
}
export declare class CustomLink<T> extends Link<T> {
    set(x: any): void;
    constructor(value: T, set: (x: T) => void);
}
export declare class CloneLink<T> extends Link<T> {
    set(x: any): void;
    constructor(parent: Link<T>, set: (x: T) => void);
}
export declare class EqualsLink extends Link<boolean> {
    parent: Link<any>;
    truthyValue: any;
    constructor(parent: Link<any>, truthyValue: any);
    set(x: boolean): void;
}
export declare class EnabledLink extends Link<boolean> {
    parent: Link<any>;
    defaultValue: any;
    constructor(parent: Link<any>, defaultValue: any);
    set(x: boolean): void;
}
export declare class ContainsLink extends Link<boolean> {
    parent: Link<any>;
    element: any;
    constructor(parent: Link<any>, element: any);
    set(x: boolean): void;
}
/**
 * Link to array or object element enclosed in parent link.
 * Performs purely functional update of the parent, shallow copying its value on `set`.
 */
export declare class LinkAt<E, K> extends Link<E> {
    private parent;
    key: K;
    constructor(parent: Link<any>, key: K);
    remove(): void;
    set(x: E): void;
}
