import React from 'react'

import cssModules from 'react-css-modules'
import styles from './Group.scss'

import Input from 'components/forms/Input/Input'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import CurrencySelect from 'components/ui/CurrencySelect/CurrencySelect'


const Group = ({ className, label, inputValueLink, currency = true, selectedCurrencyValue, onCurrencySelect }) => (
  <div styleName="group" className={className}>
    <FieldLabel>{label}</FieldLabel>
    <div styleName="groupField">
      <Input
        styleName="inputRoot"
        inputContainerClassName={styles.inputContainer}
        valueLink={inputValueLink}
        pattern="0-9\."
      />
      {
        currency && (
          <CurrencySelect
            styleName="currencySelect"
            selectedValue={selectedCurrencyValue}
            onSelect={onCurrencySelect}
          />
        )
      }
    </div>
  </div>
)

export default cssModules(Group, styles)
