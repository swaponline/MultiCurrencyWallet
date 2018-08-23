import React from 'react'

import styles from './SelectGroup.scss'
import cssModules from 'react-css-modules'

import Group from '../Group/Group'
import CurrencySelect from 'components/ui/CurrencySelect/CurrencySelect'


const SelectGroup = ({ className, label, id, inputValueLink, placeholder, selectedCurrencyValue, onCurrencySelect, currencies }) => (
  <Group
    className={className}
    label={label}
    id={id}
    inputValueLink={inputValueLink}
    placeholder={placeholder}>
    <CurrencySelect
      styleName="currencySelect"
      selectedValue={selectedCurrencyValue}
      onSelect={onCurrencySelect}
      currencies={currencies}
    />
  </Group>
)

export default cssModules(SelectGroup, styles)
