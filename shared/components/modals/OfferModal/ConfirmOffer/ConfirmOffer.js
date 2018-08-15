import React, { Component, Fragment } from 'react'

import actions from 'redux/actions'

import { links } from 'helpers'
import { BigNumber } from 'bignumber.js'
import { Link } from 'react-router-dom'

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

  state = {
    buyAmount: null,
    sellAmount: null,
    sellCurrency: null,
    buyCurrency: null,
    exchangeRate: null,
    createdAt: null
  }

  componentWillMount() {
    let { offer: { sellAmount, buyAmount, sellCurrency, buyCurrency, exchangeRate, createdAt } } = this.props
    sellAmount = new BigNumber(String(sellAmount))
    buyAmount = new BigNumber(String(buyAmount))
    this.setState({
      sellAmount,
      buyAmount,
      buyCurrency,
      sellCurrency,
      exchangeRate,
      createdAt
    })

    if (process.env.MAINNET) {
      if (sellCurrency === 'eth' && sellAmount > 0.1) {
        this.setState({
          sellAmount: 0.1,
          buyAmount: 0.007,
        })
      } else if (sellCurrency === 'btc' && sellAmount > 0.007) {
        this.setState({
          sellAmount: 0.007,
          buyAmount: 0.1,
        })
      }
    }
  }

  handleConfirm = () => {
    this.createOrder()
    actions.modals.close('OfferModal')
  }

  createOrder = () => {
    const {  buyAmount, sellAmount, buyCurrency, sellCurrency, exchangeRate, createdAt } = this.state

    const data = {
      buyCurrency: `${buyCurrency}`,
      sellCurrency: `${sellCurrency}`,
      buyAmount: Number(buyAmount),
      sellAmount: Number(sellAmount),
      exchangeRate: Number(exchangeRate),
      createdAt
    }
    actions.analytics.dataEvent('orderbook-addoffer-click-confirm-button')
    actions.core.createOrder(data)
  }

  render() {
    const { onBack } = this.props
    let {  buyAmount, sellAmount, buyCurrency, sellCurrency, exchangeRate } = this.state
    buyAmount   = buyAmount.toNumber().toFixed(5)
    sellAmount  = sellAmount.toNumber().toFixed(5)

    return (
      <Fragment>
        <Coins styleName="coins" names={[ buyCurrency, sellCurrency ]} size={100} />
        <Amounts {...{ buyAmount, sellAmount, buyCurrency, sellCurrency }} />
        <ExchangeRate {...{ value: exchangeRate, buyCurrency, sellCurrency }} />
        <Fee amount={0.0001} currency={sellCurrency} />
        <ButtonsInRow styleName="buttonsInRow">
          <Button styleName="button" gray onClick={onBack}>Back</Button>
          <Link styleName="link" to={`${links.exchange}/${buyCurrency.toLowerCase()}-${sellCurrency.toLowerCase()}`}>
            <Button styleName="button" id="confirm" brand onClick={this.handleConfirm} >Add</Button>
          </Link>
        </ButtonsInRow>
      </Fragment>
    )
  }
}
