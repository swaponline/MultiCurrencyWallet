import React from 'react'

import cssModules from 'react-css-modules'
import styles from './CurrencySelect.scss'

import Option from './Option/Option'
import DropDown from 'components/ui/DropDown/DropDown'


const CurrencySelect = ({
  className,
  selectedValue,
  onSelect,
  currencies,
  name = '',
  placeholder = '',
  label,
  tooltip = '',
  id,
  notIteractable = false,
  selectedItemRender,
}) => {
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
      label={label}
      tooltip={tooltip}
      id={id}
      name={name}
      notIteractable={notIteractable}
    />
  )
}

export default cssModules(CurrencySelect, styles)
