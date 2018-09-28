import React, { Component } from 'react'

import actions from 'redux/actions'
import { constants } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './SwapCurrencyChooser.scss'

import Flip from 'components/controls/Flip/Flip'
import Button from 'components/controls/Button/Button'
import CurrencySelect from 'components/ui/CurrencySelect/CurrencySelect'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'


@CSSModules(styles, { allowMultiple: true })
export default class SwapCurrencyChooser extends Component {

  createOffer = () => {
    actions.modals.open(constants.modals.Offer, {
      buyCurrency: this.props.buyCurrency,
      sellCurrency: this.props.sellCurrency,
    })
    actions.analytics.dataEvent('orderbook-click-createoffer-button')
  }

  render() {
    const {
      buyCurrency,
      sellCurrency,
      flipCurrency,
      handleBuyCurrencySelect,
      handleSellCurrencySelect,
      handleSubmit,
      currencies,
    } = this.props

    return (
      <div styleName="choice">
        <div styleName="row title">
          <SubTitle>Choose the direction of exchange</SubTitle>
        </div>
        <div styleName="row spacedRow">
          <div styleName="row">
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
          </div>
          <Button brand onClick={handleSubmit}>SEARCH</Button>
        </div>
      </div>
    )
  }
}
