import React from 'react'
import cssModules from 'react-css-modules'
import styles from './CurrencySelect.scss'
import Option from './Option/Option'
import DropDown from 'shared/components/ui/DropDown'

const CurrencySelect = (props) => {
  const {
    className,
    selectedValue,
    onSelect,
    currencies,
    name = '',
    placeholder = '',
    selectedItemRender,
  } = props

  // TODO: Add debug logger message to see if some currency have been dropped
  const defaultRenderSelected = (item) => <Option {...item} />
  const usedSelectedItemRender = (selectedItemRender || defaultRenderSelected)
  return (
    <DropDown
      className={className}
      placeholder={placeholder}
      items={currencies}
      selectedValue={selectedValue}
      selectedItemRender={usedSelectedItemRender}
      itemRender={item => <Option {...item} />}
      onSelect={onSelect}
      name={name}
    />
  )
}

export default cssModules(CurrencySelect, styles)
