import * as React from 'react';
import { Link, LinksCache } from './link';
export interface DataBindingSource<S> {
    linkAt<K extends keyof S>(key: K): Link<S[K]>;
    linkAll<K extends keyof S>(...keys: K[]): LinksCache<S, K>;
}
export declare abstract class LinkedComponent<P, S> extends React.Component<P, S> implements DataBindingSource<S> {
    links: LinksCache<S, keyof S>;
    linkAt<K extends keyof S>(key: K): Link<S[K]>;
    linkAll<K extends keyof S>(...keys: K[]): LinksCache<S, K>;
}
export declare class StateLink<P, S, K extends keyof S> extends Link<S[K]> {
    component: LinkedComponent<P, S>;
    key: K;
    constructor(component: LinkedComponent<P, S>, key: K, value: S[K]);
    set(x: S[K]): void;
}
