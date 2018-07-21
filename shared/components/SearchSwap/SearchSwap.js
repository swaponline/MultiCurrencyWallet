import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './SearchSwap.scss'

import CurrencySelect from 'components/ui/CurrencySelect/CurrencySelect'
import Flip from 'components/controls/Flip/Flip'


const SearchSwap = ({ buyCurrency, sellCurrency, flipCurrency, handleBuyCurrencySelect, handleSellCurrencySelect }) => (
  <div styleName="choice">
    <div styleName="row">
      <p styleName="text" >You want to buy</p>
      <CurrencySelect
        id="buyCurrency"
        styleName="currencySelect"
        selectedValue={buyCurrency}
        onSelect={handleBuyCurrencySelect}
      />
    </div>
    <Flip id="flipExchange" onClick={flipCurrency} />
    <div styleName="row">
      <p styleName="text" >You want to sell</p>
      <CurrencySelect
        id="sellCurrency"
        styleName="currencySelect"
        selectedValue={sellCurrency}
        onSelect={handleSellCurrencySelect}
      />
    </div>
  </div>
)

export default CSSModules(SearchSwap, styles)
