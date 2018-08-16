import React, { Component } from 'react'

import actions from 'redux/actions'
import { constants } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './SearchSwap.scss'

import Flip from 'components/controls/Flip/Flip'
import Button from 'components/controls/Button/Button'
import CurrencySelect from 'components/ui/CurrencySelect/CurrencySelect'


@CSSModules(styles)
export default class CreateOfferButton extends Component {

  createOffer = () => {
    actions.modals.open(constants.modals.Offer, {})
    actions.analytics.dataEvent('orderbook-click-createoffer-button')
  }

  render() {
    const { buyCurrency, sellCurrency, flipCurrency, handleBuyCurrencySelect, handleSellCurrencySelect } = this.props

    return (
      <div styleName="choice">
        <div styleName="row">
          <p styleName="text">You want to buy</p>
          <CurrencySelect
            styleName="currencySelect"
            selectedValue={buyCurrency}
            onSelect={handleBuyCurrencySelect}
          />
        </div>
        <Flip onClick={flipCurrency} />
        <div styleName="row">
          <p styleName="text">You want to sell</p>
          <CurrencySelect
            styleName="currencySelect"
            selectedValue={sellCurrency}
            onSelect={handleSellCurrencySelect}
          />
        </div>
        <div styleName="row">
          <Button brand onClick={this.createOffer}>Create offer</Button>
        </div>
      </div>
    )
  }
}
