import React, { Fragment } from 'react'

import cssModules from 'react-css-modules'
import styles from './Group.scss'

import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import CurrencySelect from 'components/ui/CurrencySelect/CurrencySelect'


const Group = ({ className, label, id, inputValueLink, currency = true, selectedCurrencyValue, onCurrencySelect, placeholder }) => (
  <Fragment>
    <FieldLabel inRow>{label}</FieldLabel>
    <div styleName="groupField" className={className}>
      <Input
        styleName="inputRoot"
        inputContainerClassName={styles.inputContainer}
        valueLink={inputValueLink}
        pattern="0-9\."
        id={id}
        placeholder={placeholder}
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
  </Fragment>
)

export default cssModules(Group, styles)
