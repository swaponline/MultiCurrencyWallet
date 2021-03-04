/**
 * Select appropriate helpers function for particular value type.
 */
export interface IterableLink {
    value : any
    at( key : number | string ) : any
}

export type Iterator = ( link : any, key : string | number ) => any;

export interface Helper {
    map( link : IterableLink, iterator : Iterator ) : any[]
    clone( obj : any ) : any,
    remove( obj : any, key : string | number ) : any
}

const ArrayProto = Array.prototype,
      ObjectProto = Object.prototype;

export function helpers( value ) : Helper {
    if( value && typeof value === 'object' ){
        switch( Object.getPrototypeOf( value ) ){
            case ArrayProto  : return arrayHelpers;
            case ObjectProto : return objectHelpers;
        }
    }

    return dummyHelpers;
}

// Do nothing for types other than Array and plain Object.
const dummyHelpers : Helper = {
    clone( value ){ return value; },
    map( link : IterableLink, fun ){ return []; },
    remove( value ){ return value; }
};

// `map` and `clone` for plain JS objects
export const objectHelpers : Helper = {
    // Map through the link to object
    map( link : IterableLink, iterator : Iterator ) : any[] {
        let mapped = [];

        for( let key in link.value ){
            const element = iterator( link.at( key ), key );
            element === void 0 || ( mapped.push( element ) );
        }

        return mapped;
    },

    remove( object : {}, key : string ) : {} {
        delete object[ key ];
        return object;
    },

     // Shallow clone plain JS object
    clone( object : {} ) : {} {
        let cloned = {};

        for( let key in object ){
            cloned[ key ] = object[ key ];
        }

        return cloned;
    }
};

// `map` and `clone` helpers for arrays.
export const arrayHelpers : Helper = {
    // Shallow clone array
    clone( array : any[] ) : any[] {
        return array.slice();
    },

    remove( array : any[], i : number ) : any[] {
        array.splice( i, 1 );
        return array;
    },

    // Map through the link to array
    map( link : IterableLink, iterator : Iterator ) : any[] {
        const length = link.value.length,
              mapped = Array( length );

        for( var i = 0, j = 0; i < length; i++ ){
            const y = iterator( link.at( i ), i );
            y === void 0 || ( mapped[ j++ ] = y );
        }

        mapped.length === j || ( mapped.length = j );

        return mapped;
    }
};