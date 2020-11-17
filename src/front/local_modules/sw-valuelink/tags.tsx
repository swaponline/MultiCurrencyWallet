import React, { Component } from 'react'
import InputMask from 'react-input-mask'
import cx from 'classnames'
import { ignoreProps } from 'helpers'


const setValue = (x, e) => e.target.value
const setBoolValue = (x, e) => Boolean(e.target.checked)

const validationClasses = ({ className, invalidClass, requiredClass }, value, error) =>
  cx(className, {
    [invalidClass || 'invalid']: Boolean(error),
    [requiredClass || 'required']: Boolean(error && value === ''),
  })


const Input = (props) => {
  const { valueLink, checkedLink, pattern, mask, maskChar, maskReplace, onChange, ...rest } = props
  const link = valueLink || checkedLink

  switch (props.type) {
    case 'checkbox':
      return (
        <input
          {...rest}
          checked={Boolean(link.value)}
          onChange={link.action(setBoolValue)}
        />
      )
    case 'radio':
      return (
        <input
          {...rest}
          checked={link.value === props.value}
          onChange={e => {
            if (e.target.checked) {
              link.set(props.value)
            }
          }}
        />
      )
    /* eslint-disable no-case-declarations */
    default:
      const className = validationClasses(rest, valueLink.value, valueLink.error)
      const node = Boolean(mask) ? InputMask : 'input'

      const nodeProps = {
        ...rest,
        className,
        value: typeof valueLink.value !== 'undefined' ? String(valueLink.value) : '',
        onChange: valueLink.action((x, e) => {
          let val = e.target.value

          if (pattern && val) {
            val = val.replace(new RegExp(`[^${pattern}]+`, 'g'), '')
          }

          if (rest.isPriceValueMask && val) {
            if (val.length === 1 && val === '.') {
              val = '0.'
            }
            if (x.match(/\./g) && val.match(/\./g) && x.match(/\./g).length === 1 && val.match(/\./g).length > 1) {
              val = x
            }
          }

          if (mask && val) {
            if (maskReplace) {
              return val.replace(maskReplace, '')
            }
            else if (maskReplace !== null && maskReplace !== false) {
              return val.replace(/[^0-9]+/g, '')
            }
          }
          if (typeof onChange === 'function') onChange(e)
          return val
        }),
      }

      if (mask) {
        nodeProps.mask = mask
        nodeProps.maskChar = maskChar
      }

      return React.createElement(node, nodeProps)
  }
  /* eslint-enable no-case-declarations */
}

class NumberInput extends Component<any, any> {

   onKeyPress: any
   value: any
   error: any

  constructor() {
    //@ts-ignore
    super(...arguments)

    this.onKeyPress = (event) => {
      const { integer, positive } = this.props
      const { charCode, ctrlKey } = event

      const allowedCharCodes = (positive ? [] : [45]).concat(integer ? [] : [46])

      if (ctrlKey) {
        return
      }

      if (
        charCode
        && (charCode < 48 || charCode > 57)
        && allowedCharCodes.indexOf(charCode) < 0
      ) {
        event.preventDefault()
      }
    }
  }

  componentWillMount() {
    this.setAndConvert(this.props.valueLink.value)
  }

  componentWillReceiveProps(nextProps) {
    const { valueLink: next } = nextProps

    if (Number(next.value) !== Number(this.value)) {
      this.setAndConvert(next.value) // keep state being synced
    }
  }

  setValue(x) {
    // We're not using native state in order to avoid race condition.
    this.value = String(x)
    this.error = this.value === '' || isNaN(Number(x))

    this.forceUpdate()
  }

  setAndConvert(x) {
    let value = Number(x)

    if (this.props.positive) {
      value = Math.abs(x)
    }
    if (this.props.integer) {
      value = Math.round(value)
    }

    this.setValue(value)
  }

  onChange = (e) => {
    const { value } = e.target
    const asNumber = Number(value)

    this.setValue(value)

    if (value && !isNaN(asNumber)) {
      this.props.valueLink.update(x => {
        // Update link if value is changed
        if (asNumber !== Number(x)) {
          return asNumber
        }
      })
    }
  }

  render() {
    const { valueLink, ...props } = this.props
    const error = valueLink.error || this.error

    return (
      <input
        {...ignoreProps(props, 'positive', 'integer')}
        //@ts-ignore
        className={validationClasses(props, this.value, error)}
        value={this.value}
        onKeyPress={this.onKeyPress}
        onChange={this.onChange}
      />
    )
  }
}

/**
 * Wrapper for standard <textarea/> to be compliant with React 0.14 valueLink semantic.
 * Simple supports for link validation - adds 'invalid' class if link has an error.
 *
 *     <TextArea valueLink={ linkToText } />
 */
const TextArea = ({ valueLink, ...props }) => (
  <textarea
    {...props}
    //@ts-ignore
    className={validationClasses(props, valueLink.value, valueLink.error)}
    value={valueLink.value}
    onChange={valueLink.action(setValue)}
  />
)

/**
 * Wrapper for standard <select/> to be compliant with React 0.14 valueLink semantic.
 * Regular <option/> tags must be used:
 *
 *     <Select valueLink={ linkToSelectedValue }>
 *         <option value="a">A</option>
 *         <option value="b">B</option>
 *     </Select>
 */
const Select = ({ valueLink, children, ...props }) => (
  <select
    {...props}
    value={valueLink.value}
    onChange={valueLink.action(setValue)}
  >
    {children}
  </select>
)

/**
 * Simple custom <Radio/> tag implementation. Can be easily styled.
 * Intended to be used with offhand bool link:
 *
 *    <Radio checkedLink={ linkToValue.equals( optionValue ) />
 */
const Radio = ({ className = 'radio', checkedLink, children }) => (
  <div
    className={cx(className, { 'selected': checkedLink.value })}
    onClick={checkedLink.action(() => true)}
  >
    {children}
  </div>
)

/**
 * Simple custom <Checkbox /> tag implementation.
 * Takes any type of boolean link. Can be easily styled.
 *
 *     <Checkbox checkedLink={ boolLink } />
 */
const Checkbox = ({ className = 'checkbox', checkedLink, children }) => (
  <div
    className={cx(className, { 'selected': checkedLink.value })}
    onClick={checkedLink.action(x => !x)}
  >
    {children}
  </div>
)


export {
  Input,
  TextArea,
  Select,
  Radio,
  Checkbox,
  NumberInput,
}
