import React, { Fragment } from 'react'

import styles from './Group.scss'
import cssModules from 'react-css-modules'

import Input from 'components/forms/Input/Input'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import CurrencySelect from 'components/ui/CurrencySelect/CurrencySelect'


const Group = ({ className, label, id, inputValueLink, selectedCurrencyValue, onCurrencySelect, placeholder, currency = true, buyCurrency = false, sellCurrency = false }) => (
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
        buyCurrency && sellCurrency && (
          <span styleName="currencyRatio">{buyCurrency} / {sellCurrency}</span>
        )
      }
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
