import * as React from 'react'
import { Link, LinksCache } from './link'

export interface DataBindingSource< S >{
    linkAt< K extends keyof S>( key : K ) : Link< S[ K ] >
    linkAll<K extends keyof S>( ...keys : K[] ) : LinksCache< S, K >
}

export abstract class LinkedComponent< P, S > extends React.Component< P, S > implements DataBindingSource< S > {
    links : LinksCache< S, keyof S > = null;

    linkAt< K extends keyof S>( key : K ) : Link< S[ K ] >{
        return linkAt( this, key );
    }

    linkAll<K extends keyof S>( ...keys : K[] ) : LinksCache< S, K >;
    linkAll( ...args : ( keyof S )[] ){
        return linkAll( this, args );
    }
}

Link.all = < P, S >( component : React.Component< P, S >, ..._keys : ( keyof S )[] ) => linkAll( <LinkedComponent< P, S >>component, _keys );
Link.state = linkAt;

function linkAll< P, S, K extends keyof S >( component : LinkedComponent< P, S >, _keys : K[] ) : LinksCache< S, K >{
    const { state } = component,
            cache = component.links || ( component.links = <any>{} ),
            keys = _keys.length ? _keys : <( keyof S )[]>Object.keys( state );

    for( let key of keys ){
        const value = state[ key ],
            cached = cache[ key ];

        if( !cached || cached.value !== value ) {
            cache[ key ] = new StateLink( component, key, value );
        }
    }

    return cache;
}

function linkAt< P, S, K extends keyof S>( component : LinkedComponent< P, S>, key : K ) : Link< S[ K ] >{
    const value = component.state[ key ],
        cache = component.links || ( component.links = <any>{} ),
        cached = cache[ key ];

    return cached && cached.value === value ? cached : cache[ key ] = new StateLink( component, key, value );
}

export class StateLink< P, S, K extends keyof S > extends Link< S[ K ] > {
    constructor( public component : LinkedComponent< P, S >, public key : K, value : S[ K ] ){
        super( value );
    }

    set( x : S[ K ] ) : void {
        const attrs = <Pick<S, K>> {};
        attrs[ this.key ] = x;
        this.component.setState( attrs );
    }
}