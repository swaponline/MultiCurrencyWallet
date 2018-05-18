import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './SearchTrade.scss'

import Flip from '../controls/Flip/Flip'
import Button from '../controls/Button/Button'
import TradePanel from '../TradePanel/TradePanel'

function SearchTrade() {
  return (
    <div styleName="search-trade">
      <div className="container">
        <div styleName="trade-panel trade-panel_row">
          <TradePanel
            styleName="trade-panel__want_row trade-panel__want"
            row="trade-panel__group_row"
            name="You want"
            currency="BTC"
          />
          <Flip />
          <TradePanel
            styleName="trade-panel__have_row trade-panel__have"
            row="trade-panel__group_row"
            name="You have"
            currency="ETH"
          />
          <Button styleName="trade-panel__search" text="Search" />
        </div>
      </div>
    </div>
  )
}

export default CSSModules(SearchTrade, styles, { allowMultiple: true })

