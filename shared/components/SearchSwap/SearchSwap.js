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
    actions.modals.open(constants.modals.Offer, {
      buyCurrency: this.props.buyCurrency,
      sellCurrency: this.props.sellCurrency,
    })
    actions.analytics.dataEvent('orderbook-click-createoffer-button')
  }

  render() {
    const { buyCurrency, sellCurrency, flipCurrency, handleBuyCurrencySelect, handleSellCurrencySelect, currencies } = this.props

    return (
      <div styleName="choice">
        <div styleName="row">
          <p styleName="text">You have </p>
          <CurrencySelect
            styleName="currencySelect"
            selectedValue={sellCurrency}
            onSelect={handleSellCurrencySelect}
            currencies={currencies}
          />
        </div>
        <Flip onClick={flipCurrency} />
        <div styleName="row">
          <p styleName="text">You get</p>
          <CurrencySelect
            styleName="currencySelect"
            selectedValue={buyCurrency}
            onSelect={handleBuyCurrencySelect}
            currencies={currencies}
          />
        </div>
        <div styleName="row">
          <Button brand onClick={this.createOffer}>Create offer</Button>
        </div>
      </div>
    )
  }
}
