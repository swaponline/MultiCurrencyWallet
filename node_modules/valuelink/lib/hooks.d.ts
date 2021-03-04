/// <reference types="react" />
import { CustomLink, Link } from './link';
/**
 * Create the linked local state.
 */
export declare function useLink<S>(initialState: S | (() => S)): CustomLink<import("react").SetStateAction<S>>;
export interface LinksHash {
    [name: string]: Link<any>;
}
/**
 * Unwrap object with links, returning an object of a similar shape filled with link values.
 */
export declare function linksValues<K extends keyof L, L extends LinksHash>(links: L): {
    [name in K]: any;
};
/**
 * Unwrap object with links, returning an object of a similar shape filled with link errors.
 */
export declare function linksErrors<K extends keyof L, L extends LinksHash>(links: L): {
    [name in K]: L[name]["value"];
};
/**
 * Assing links with values from the source object.
 * Used for
 *    setLinks({ name, email }, json);
 */
export declare function setLinks(links: LinksHash, source: object): void;
