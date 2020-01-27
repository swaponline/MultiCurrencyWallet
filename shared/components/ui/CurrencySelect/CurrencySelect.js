import React from 'react'

import cssModules from 'react-css-modules'
import styles from './CurrencySelect.scss'

import Option from './Option/Option'
import DropDown from 'components/ui/DropDown/DropDown'


const CurrencySelect = ({ 
  className, selectedValue, onSelect, currencies, name, placeholder, label, tooltip, id, switchBalanceFunc, notIteractable,
}) => {
  // remove null values in object map
  const nonNullCurrencies = currencies.filter(currency => !!currency !== false)
  // TODO: Add debug logger message to see if some currency have been dropped
  return (
    <DropDown
      className={className}
      placeholder={placeholder}
      items={currencies}
      switchBalanceFunc={switchBalanceFunc}
      selectedValue={selectedValue}
      selectedItemRender={(item) => <Option {...item} />}
      itemRender={(item) => <Option {...item} />}
      onSelect={onSelect}
      label={label}
      tooltip={tooltip}
      id={id}
      name={name}
      notIteractable={notIteractable}
    />
  )
}

export default cssModules(CurrencySelect, styles)
