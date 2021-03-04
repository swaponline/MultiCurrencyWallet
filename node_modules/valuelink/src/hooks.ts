import { useState } from 'react'
import { CustomLink, Link } from './link'

/**
 * Create the linked local state.
 */
export function useLink<S>( initialState : S | (() => S) ){
    const [ value, set ] = useState( initialState );
    return new CustomLink( value, set );
}

export interface LinksHash {
    [ name : string ] : Link<any>
}

/**
 * Unwrap object with links, returning an object of a similar shape filled with link values.
 */
export function linksValues<K extends keyof L, L extends LinksHash>( links : L )
    : { [ name in K ] : any } {
    return unwrap( links, 'error' ) as any;
}

/**
 * Unwrap object with links, returning an object of a similar shape filled with link errors.
 */
export function linksErrors<K extends keyof L, L extends LinksHash>( links : L )
    : { [ name in K ] : L[name]["value"] } {
    return unwrap( links, 'value' ) as any;
}

/**
 * Assing links with values from the source object.
 * Used for 
 *    setLinks({ name, email }, json);
 */
export function setLinks( links : LinksHash, source : object ) : void {
    for( let key of Object.keys( links ) ){
        if( source.hasOwnProperty( key ) ){
            links[ key ].set( source[ key ] );
        }
    }
}

function unwrap( links : LinksHash, field : string) : object {
    const values = {};

    for( let key of Object.keys( links ) ){
        const value = links[ key ][ field ];
        if( value !== void 0 ){
            values[ key ] = value;
        }
    }

    return values;
}