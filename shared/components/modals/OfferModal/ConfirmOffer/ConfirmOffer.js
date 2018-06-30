import React, { Component, Fragment } from 'react'

import actions from 'redux/actions'
import { swapApp } from 'instances/newSwap'

import cssModules from 'react-css-modules'
import styles from './ConfirmOffer.scss'

import ButtonsInRow from 'components/controls/ButtonsInRow/ButtonsInRow'
import Button from 'components/controls/Button/Button'
import Coins from 'components/Coins/Coins'

import Amounts from './Amounts/Amounts'
import ExchangeRate from './ExchangeRate/ExchangeRate'
import Fee from './Fee/Fee'


@cssModules(styles)
export default class ConfirmOffer extends Component {

  handleConfirm = () => {
    this.createOrder()
    actions.modals.close('OfferModal')
  }

  createOrder = () => {
    const { offer: { buyAmount, sellAmount, buyCurrency, sellCurrency } } = this.props
    const data = {
      buyCurrency: `${buyCurrency}`,
      sellCurrency: `${sellCurrency}`,
      buyAmount: Number(buyAmount),
      sellAmount: Number(sellAmount),
    }
    actions.analytics.dataEvent('orderbook-addoffer-click-confirm-button')

    swapApp.services.orders.create(data)
  }

  render() {
    const { offer: { exchangeRate, buyAmount, sellAmount, buyCurrency, sellCurrency }, onBack } = this.props

    return (
      <Fragment>
        <Coins styleName="coins" names={[ buyCurrency, sellCurrency ]} size={100} />
        <Amounts {...{ buyAmount, sellAmount, buyCurrency, sellCurrency }} />
        <ExchangeRate {...{ value: exchangeRate, buyCurrency, sellCurrency }} />
        <Fee amount={0.0001} currency={sellCurrency} />
        <ButtonsInRow styleName="buttonsInRow">
          <Button styleName="button" gray onClick={onBack}>Back</Button>
          <Button styleName="button" id="confirm" brand onClick={this.handleConfirm}>Add</Button>
        </ButtonsInRow>
      </Fragment>
    )
  }
}
