/**
 * Advanced React links for purely functional two-way data binding
 *
 * MIT License, (c) 2016 Vlad Balin, Volicon.
 */
import { helpers, arrayHelpers, objectHelpers } from './helpers'

export type Transform< T > = ( value : T, event? : {} ) => T
export type EventHandler = ( event : {} ) => void

export interface Validator< T >{
    ( value : T ) : boolean
    error? : any
}

export type LinksCache< S, X extends keyof S> = {
    [ K in X ] : Link< S[ K ] >
}

// Main Link class. All links must extend it.
export abstract class Link< T >{
    // @deprecated API. Use component subclass.
    static state : < P, S, K extends keyof S>( component : React.Component< P, S >, key : K ) => Link< S[ K ] >;
    static all : < P, S, K extends keyof S >( component : React.Component< P, S >, ..._keys : K[] ) => LinksCache< S, K >;

    // Create custom link to arbitrary value
    static value< T >( value : T, set : ( x : T ) => void ) : Link< T >{
        return new CustomLink( value, set );
    }

    // create 
    constructor( public value : T ){}

    // Validation error. Usually is a string with error text, but can hold any type.
    error : any

    // DEPRECATED: Old error holder for backward compatibility with Volicon code base
    get validationError() : any { return this.error }

    // Link set functions
    abstract set( x : T ) : void

    onChange( handler : ( x : T ) => void ) : Link< T > {
        return new CloneLink( this, (x : T ) => {
            handler( x );
            this.set( x );
        });
    }

    // <input { ...link.props } />
    get props(){
        return typeof this.value === 'boolean' ? {
            checked : this.value,
            onChange : e => this.set( Boolean( e.target.checked ) as any )
        }:{
            value : this.value,
            onChange : e => this.set( e.target.value )
        };
    }

    // DEPRECATED: Old React method for backward compatibility
    requestChange( x : T ) : void {
        this.set( x );
    }

    // Immediately update the link value using given transform function.
    update( transform : Transform< T >, e? : Object ) : void {
        const next = transform( this.clone(), e );
        next === void 0 || this.set( next );
    }

    // Create new link which applies transform function on set.
    pipe( handler : Transform< T > ) : Link< T > {
        return new CloneLink( this, x =>{
            const next = handler( x, this.value );
            next === void 0 || this.set( next );
        } );
    }

    // Create UI event handler function which will update the link with a given transform function.
    action( transform : Transform< T > ) : EventHandler {
        return e => this.update( transform, e );
    }

    equals( truthyValue : T ) : Link<boolean> {
        return new EqualsLink( this, truthyValue );
    }

    enabled( defaultValue? : T ) : Link<boolean> {
        return new EnabledLink( this, defaultValue || "" );
    }

    // Array-only links methods
    contains<E>( this : Link<E[]>, element : E ) : Link<boolean>{
        return new ContainsLink( this, element );
    }

    push<E>( this : Link<E[]>, ...args : E[] ) : void;
    push(){
        const array = arrayHelpers.clone( this.value );
        Array.prototype.push.apply( array, arguments );
        this.set( array );
    }

    unshift<E>( this : Link<E[]>, ...args : E[] ) : void;
    unshift() : void {
        const array = arrayHelpers.clone( this.value );
        Array.prototype.unshift.apply( array, arguments );
        this.set( array );
    }

    splice( start : number, deleteCount? : number );
    splice() : void {
        const array = arrayHelpers.clone( this.value );
        Array.prototype.splice.apply( array, arguments );
        this.set( array );
    }

    // Array and objects universal collection methods
    map<E, Z>( this : Link<E[]>, iterator : ( link : LinkAt<E, number>, idx : number ) => Z ) : Z[];
    map<E, Z>( this : Link<{[ key : string ] : E }>, iterator : ( link : LinkAt<E, string>, idx : string ) => Z ) : Z[];
    map( iterator ) {
        return helpers( this.value ).map( this, iterator );
    }

    removeAt<E>( this : Link<E[]>, key : number ) : void;
    removeAt<E>( this : Link<{ [ key : string ] : E }>, key : string ) : void;
    removeAt( key ){
        const { value } = this,
            _ = helpers( value );

        this.set( _.remove( _.clone( value ), key ) );
    }

    at< E >( this : Link< E[] >, key : number ) : LinkAt<E, number>;
    at< K extends keyof T, E extends T[K]>( key : K ) : LinkAt<E, K>;
    at( key ){
        return new LinkAt( this, key );
    }

    clone() : T {
        let { value } = this;
        return helpers( value ).clone( value );
    }

    pick< K extends keyof T >( ...keys : K[]) : {[ P in K ]: Link<T[P]>}
    pick() {
        let links = {};

        for( let i = 0; i < arguments.length; i++ ){
            const key : string = arguments[ i ];
            links[ key ] = new LinkAt( this, key );
        }

        return links;
    }

    /**
     * Validate link with validness predicate and optional custom error object. Can be chained.
     */
    check( whenValid : Validator< T >, error? : any ) : this {
        if( !this.error && !whenValid( this.value ) ){
            this.error = error || whenValid.error || defaultError;
        }

        return this;
    }
}

export class CustomLink< T > extends Link< T > {
    set( x ){}

    constructor( value : T, set : ( x : T ) => void ){
        super( value );
        this.set = set;
    }
}

export class CloneLink< T > extends Link< T > {
    set( x ){}

    constructor( parent : Link< T >, set : ( x : T ) => void ){
        super( parent.value );
        this.set = set;

        const { error } = parent;
        if( error ) this.error = error;
    }
}

export class EqualsLink extends Link< boolean > {
    constructor( public parent : Link< any >, public truthyValue ){
        super( parent.value === truthyValue );
    }

    set( x : boolean ) : void {
        this.parent.set( x ? this.truthyValue : null );
    }
}

export class EnabledLink extends Link< boolean > {
    constructor( public parent : Link< any >, public defaultValue ){
        super( parent.value != null );
    }

    set( x : boolean ){
        this.parent.set( x ? this.defaultValue : null );
    }
}

export class ContainsLink extends Link< boolean > {
    constructor( public parent : Link< any >, public element : any ){
        super( parent.value.indexOf( element ) >= 0 );
    }

    set( x : boolean ){
        var next = Boolean( x );

        if( this.value !== next ){
            var arr : any[] = this.parent.value,
                nextValue = x ? arr.concat( this.element ) : arr.filter( el => el !== this.element );

            this.parent.set( nextValue );
        }
    }
}

const  defaultError = 'Invalid value';

/**
 * Link to array or object element enclosed in parent link.
 * Performs purely functional update of the parent, shallow copying its value on `set`.
 */
export class LinkAt< E, K > extends Link< E > {
    constructor( private parent : Link< any >, public key : K ){
        super( parent.value[ key ] );
    }

    remove(){
        this.parent.removeAt( <any>this.key );
    }

    // Set new element value to parent array or object, performing purely functional update.
    set( x : E ) : void {
        if( this.value !== x ){
            this.parent.update( value => {
                value[ this.key ] = x;
                return value;
            } );
        }
    };
}