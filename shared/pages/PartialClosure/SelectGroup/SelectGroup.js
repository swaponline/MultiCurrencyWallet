import React from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'

import CSSModules from 'react-css-modules'
import styles from './SelectGroup.scss'

import Input from 'components/forms/Input/Input'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import CurrencySelect from 'components/ui/CurrencySelect/CurrencySelect'
import Tooltip from 'components/ui/Tooltip/Tooltip'

import { inputReplaceCommaWithDot } from 'helpers/domUtils'

// TODO to split data and view this component
const SelectGroup = ({ selectedValue, onSelect, currencies, usd, placeholder, label, disabled, className, inputValueLink, tooltip, id, ...props }) => (
  <div>
    <FieldLabel inRow>
      <strong>
        {label}
      </strong>
      &nbsp;
      <Tooltip id={id}>
        {tooltip}
      </Tooltip>
    </FieldLabel>
    <div styleName="groupField" className={className}>
      <Input
        styleName="inputRoot"
        inputContainerClassName="inputContainer"
        valueLink={inputValueLink}
        type="number"
        placeholder={placeholder}
        pattern="0-9\."
        disabled={disabled}
        onFocus={props.onFocus ? props.onFocus : () => {}}
        onBlur={props.onBlur ? props.onBlur : () => {}}
        onKeyDown={inputReplaceCommaWithDot}
      />
      {
        (selectedValue === 'eth' || selectedValue === 'btc') && usd > 0 &&
        <p styleName="textUsd" >{`~${usd}`}$</p>
      }
      <CurrencySelect
        styleName="currencySelect"
        selectedValue={selectedValue}
        onSelect={onSelect}
        currencies={currencies}
      />
    </div>
  </div>
)

export default injectIntl(CSSModules(SelectGroup, styles, { allowMultiple: true }))
