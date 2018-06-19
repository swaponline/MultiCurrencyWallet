import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './SearchSwap.scss'

import CurrencySelect from 'components/ui/CurrencySelect/CurrencySelect'
import Flip from 'components/controls/Flip/Flip'


const SearchSwap = ({ buyCurrency, sellCurrency, updateFilter, flipCurrency }) => (
  <div styleName="choice">
    <div styleName="row">
      <p styleName="text" >You want buy</p>
      <CurrencySelect
        styleName="currencySelect"
        selectedValue={buyCurrency}
        onSelect={updateFilter}
      />
    </div>
    <Flip onClick={flipCurrency} />
    <div styleName="row">
      <p styleName="text" >You want sell</p>
      <CurrencySelect
        styleName="currencySelect"
        selectedValue={sellCurrency}
        onSelect={updateFilter}
      />
    </div>
  </div>
)

export default CSSModules(SearchSwap, styles)
