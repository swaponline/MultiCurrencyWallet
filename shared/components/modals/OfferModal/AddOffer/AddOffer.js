import React, { Fragment, Component } from 'react'
import Link from 'sw-valuelink'

import cssModules from 'react-css-modules'
import styles from './AddOffer.scss'

import Button from 'components/controls/Button/Button'

import Group from './Group/Group'


const exchangeRates = {
  'ethbtc': 0.001,
  'btceth': 1000,
  'ethnoxon': 1,
  'noxoneth': 1,
  'btcnoxon': 1000,
  'noxonbtc': 1000,
}

@cssModules(styles, { allowMultiple: true })
export default class AddOffer extends Component {

  state = {
    exchangeRate: exchangeRates.ethbtc,
    buyAmount: '',
    sellAmount: '',
    buyCurrency: 'eth',
    sellCurrency: 'btc',
  }

  getExchangeRate = (buyCurrency, sellCurrency) =>
    exchangeRates[`${buyCurrency.toLowerCase()}${sellCurrency.toLowerCase()}`]

  handleBuyCurrencySelect = ({ value }) => {
    let { buyCurrency, sellCurrency } = this.state

    // init:    buyCurrency = ETH, sellCurrency = BTC, value = BTC
    // result:  buyCurrency = BTC, sellCurrency = ETH
    if (value === sellCurrency) {
      sellCurrency = buyCurrency
    }

    buyCurrency = value

    const exchangeRate = this.getExchangeRate(buyCurrency, sellCurrency)

    this.setState({
      exchangeRate,
      buyCurrency: value,
      sellCurrency: buyCurrency,
    })
  }

  handleSellCurrencySelect = ({ value }) => {
    let { buyCurrency, sellCurrency } = this.state

    if (value === buyCurrency) {
      buyCurrency = sellCurrency
    }

    sellCurrency = value

    const exchangeRate = this.getExchangeRate(buyCurrency, sellCurrency)

    this.setState({
      exchangeRate,
      buyCurrency: value,
      sellCurrency: buyCurrency,
    })
  }

  handleBuyAmountChange = (value) => {
    const { exchangeRate } = this.state

    this.setState({
      sellAmount: value * exchangeRate,
    })
  }

  handleSellAmountChange = (value) => {
    const { exchangeRate } = this.state

    this.setState({
      buyAmount: value / exchangeRate,
    })
  }

  render() {
    const { buyCurrency, sellCurrency } = this.state
    const { next } = this.props

    const linked = Link.all(this, 'exchangeRate', 'buyAmount', 'sellAmount')

    return (
      <Fragment>
        <Group
          styleName="buyGroup"
          label="Exchange rate"
          inputValueLink={linked.exchangeRate}
          currency={false}
        />
        <Group
          styleName="buyGroup"
          label="Buy"
          inputValueLink={linked.buyAmount.onChange(this.handleBuyAmountChange)}
          selectedCurrencyValue={buyCurrency}
          onCurrencySelect={this.handleBuyCurrencySelect}
        />
        <Group
          label="Sell"
          inputValueLink={linked.sellAmount.onChange(this.handleSellAmountChange)}
          selectedCurrencyValue={sellCurrency}
          onCurrencySelect={this.handleSellCurrencySelect}
        />
        <Button styleName="button" onClick={next}>Next</Button>
      </Fragment>
    )
  }
}
