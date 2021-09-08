import React from 'react'
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

  const defaultRenderSelected = (item) => <Option {...item} />
  const usedSelectedItemRender = (selectedItemRender || defaultRenderSelected)
  return (
    <DropDown
      className={className}
      placeholder={placeholder}
      items={currencies}
      selectedValue={selectedValue}
      selectedItemRender={usedSelectedItemRender}
      itemRender={defaultRenderSelected}
      onSelect={onSelect}
      name={name}
      role="SelectCurrency"
    />
  )
}

export default CurrencySelect
