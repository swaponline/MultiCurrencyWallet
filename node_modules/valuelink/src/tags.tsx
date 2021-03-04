/**
 * Linked React components for building forms implementing React 0.14 valueLink semantic.
 *
 * WTFPL License, (c) 2016 Vlad Balin, Volicon.
 */


import * as React from 'react'
import { Validator, Link } from './link'

const setValue     = ( x, e ) => e.target.value;
const setBoolValue = ( x, e ) => Boolean( e.target.checked );

/**
 * Wrapper for standard <input/> to be compliant with React 0.14 valueLink semantic.
 * Simple supports for link validation - adds 'invalid' class if link has an error.
 *
 *      <input type="checkbox" checkedLink={ linkToBool } />
 *      <input type="radio"    valueLink={ linkToSelectedValue } value="option1value" />
 *      <input type="text"     valueLink={ linkToString } />
 */

function validationClasses( props, value, error ){
    let classNames = props.className ? [ props.className ] : [];

    if( error ){
        classNames.push( props.invalidClass || 'invalid' );

        if( value === '' ){
            classNames.push( props.requiredClass || 'required' );
        }
    }

    return classNames.join( ' ' );
}

export type AnyProps = { [ key : string ] : any };

export interface InputProps extends React.HTMLProps<HTMLInputElement> {
    valueLink? : Link<any>
    checkedLink? : Link<boolean>
    value? : any
}

export function Input( props : InputProps ) : JSX.Element;

export function Input( props ){
        const { valueLink, checkedLink, ...rest } = props,
          type = props.type,
          link = valueLink || checkedLink;

    switch( type ){
        case 'checkbox':
            return <input {...rest}
                checked={ Boolean( link.value ) }
                onChange={ link.action( setBoolValue ) }/>;

        case 'radio' :
            return <input {...rest}
                checked={ link.value === props.value }
                onChange={ e => { e.target.checked && link.set( props.value ) } }/>;

        default:
            return <input {...rest}
                className={ validationClasses( rest, valueLink.value, valueLink.error ) }
                value={ String( valueLink.value ) }
                onChange={ valueLink.action( setValue ) }/>;
    }
};

export const isRequired : Validator< any > = x => x != null && x !== '';
isRequired.error = 'Required';

const emailPattern   = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
export const isEmail : Validator< string > = x => Boolean( x.match( emailPattern ) );
isEmail.error = 'Should be valid email';

// This number component rejects invalid input and modify link only with valid number values.
// Implementing numeric input rejection might be tricky.
export interface NumberInputProps extends React.HTMLProps<HTMLInputElement>{
        positive?  : boolean,
        integer?   : boolean,
        valueLink : Link< number >
}

export class NumberInput extends React.Component< NumberInputProps, {} >{
    componentWillMount(){
        // Initialize component state
        this.setAndConvert( this.props.valueLink.value );
    }

    value : string;
    error : any;

    setValue( x ){
        // We're not using native state in order to avoid race condition.
        this.value = String( x );
        this.error = this.value === '' || isNaN( Number( x ) );
        this.forceUpdate();
    }

    setAndConvert( x ){
        let value = Number( x );

        if( this.props.positive ){
            value = Math.abs( x );
        }

        if( this.props.integer ){
            value = Math.round( value );
        }

        this.setValue( value );
    }

    componentWillReceiveProps( nextProps ){
        const { valueLink : next } = nextProps;

        if( Number( next.value ) !== Number( this.value ) ){
            this.setAndConvert( next.value ); // keep state being synced
        }
    }

    render(){
        const { valueLink, positive, integer, ...props } = this.props,
              error = valueLink.error || this.error;

        return <input { ...props }
                      type="text"
                      className={ validationClasses( props, this.value, error ) }
                      value={ this.value }
                      onKeyPress={ this.onKeyPress }
                      onChange={ this.onChange }
        />;
    }

    onKeyPress = e =>{
        const { charCode } = e,
              { integer, positive } = this.props,
              allowed = ( positive ? [] : [ 45 ]).concat( integer ? [] : [ 46 ] );

        if( e.ctrlKey ) return;

        if( charCode && // allow control characters
            ( charCode < 48 || charCode > 57 ) && // char is number
            allowed.indexOf( charCode ) < 0 ){ // allowed char codes
            e.preventDefault();
        }
    };

    onChange = e => {
        // Update local state...
        const { value } = e.target;
        this.setValue( value );

        const asNumber = Number( value );

        if( value && !isNaN( asNumber ) ){
            this.props.valueLink.update( x =>{
                // Update link if value is changed
                if( asNumber !== Number( x ) ){
                    return asNumber;
                }
            } );
        }
    }
}

/**
 * Wrapper for standard <textarea/> to be compliant with React 0.14 valueLink semantic.
 * Simple supports for link validation - adds 'invalid' class if link has an error.
 *
 *     <TextArea valueLink={ linkToText } />
 */
export const TextArea = ( { valueLink, ...props } : { valueLink : Link<string> } & React.HTMLProps<HTMLTextAreaElement>) => (
    <textarea {...props}
        className={ validationClasses( props, valueLink.value , valueLink.error ) }
        value={ valueLink.value }
        onChange={ valueLink.action( setValue ) }/>
);

/**
 * Wrapper for standard <select/> to be compliant with React 0.14 valueLink semantic.
 * Regular <option/> tags must be used:
 *
 *     <Select valueLink={ linkToSelectedValue }>
 *         <option value="a">A</option>
 *         <option value="b">B</option>
 *     </Select>
 */
export const Select = ( { valueLink, children, ...props } : { valueLink : Link<any> } & React.HTMLProps<HTMLSelectElement> ) => (
    <select {...props}
        value={ valueLink.value }
        onChange={ valueLink.action( setValue ) }>
        { children }
    </select>
);

/**
 * Simple custom <Radio/> tag implementation. Can be easily styled.
 * Intended to be used with offhand bool link:
 *
 *    <Radio checkedLink={ linkToValue.equals( optionValue ) />
 */
export const Radio = ( { className = 'radio', checkedLink, children } : { checkedLink : Link<boolean> } & React.HTMLProps<HTMLDivElement> ) => (
    <div className={ className + ( checkedLink.value ? ' selected' : '' ) }
         onClick={ checkedLink.action( () => true ) }
    >
        { children }
    </div>
);

/**
 * Simple custom <Checkbox /> tag implementation.
 * Takes any type of boolean link. Can be easily styled.
 *
 *     <Checkbox checkedLink={ boolLink } />
 */
export const Checkbox = ( { className = 'checkbox', checkedLink, children } : { checkedLink : Link<boolean> } & React.HTMLProps<HTMLDivElement> ) => (
    <div className={ className + ( checkedLink.value ? ' selected' : '' ) }
         onClick={ checkedLink.action( x => !x ) }
    >
        { children }
    </div>
);
