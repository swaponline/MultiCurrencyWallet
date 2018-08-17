import React from 'react'

import cssModules from 'react-css-modules'
import styles from './CurrencySelect.scss'

import Option from './Option/Option'
import DropDown from 'components/ui/DropDown/DropDown'


const CurrencySelect = ({ className, selectedValue, onSelect, currencies }) => (
  <DropDown
    className={className}
    items={currencies}
    selectedValue={selectedValue}
    selectedItemRender={(item) => <Option {...item} />}
    itemRender={(item) => <Option {...item} />}
    onSelect={onSelect}
  />
)

export default cssModules(CurrencySelect, styles)
