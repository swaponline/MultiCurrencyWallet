import React from 'react'

import cssModules from 'react-css-modules'
import styles from './CurrencySelect.scss'

import Option from './Option/Option'
import DropDown from 'components/ui/DropDown/DropDown'


const CurrencySelect = ({ className, selectedValue, onSelect }) => (
  <DropDown
    className={className}
    items={[
      { title: 'ETH', icon: 'eth', value: 'eth' },
      { title: 'BTC', icon: 'btc', value: 'btc' },
      { title: 'NOXON', icon: 'noxon', value: 'noxon' },
      { title: 'SWAP', icon: 'swap', value: 'swap' },
    ]}
    selectedValue={selectedValue}
    selectedItemRender={(item) => <Option {...item} />}
    itemRender={(item) => <Option {...item} />}
    onSelect={onSelect}
  />
)

export default cssModules(CurrencySelect, styles)
