import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './SelectGroup.scss'

import Input from 'components/forms/Input/Input'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import CurrencySelect from 'components/ui/CurrencySelect/CurrencySelect'

// TODO to split data and view this component
const SelectGroup = ({ selectedValue, onSelect, currencies, placeholder, label, disabled, className, inputValueLink }) => (
  <div>
    <FieldLabel inRow>{label}</FieldLabel>
    <div styleName="groupField" className={className}>
      <Input
        styleName="inputRoot"
        inputContainerClassName="inputContainer"
        valueLink={inputValueLink}
        type="number"
        placeholder={placeholder}
        pattern="0-9."
        disabled={disabled}
      />
      <CurrencySelect
        styleName="currencySelect"
        selectedValue={selectedValue}
        onSelect={onSelect}
        currencies={currencies}
      />
    </div>
  </div>
)

export default CSSModules(SelectGroup, styles)
