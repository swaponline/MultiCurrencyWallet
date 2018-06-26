/* eslint-disable */
import React, { Fragment, Component } from 'react'
import { connect } from 'redaction'
import config from 'app-config'

import Link from 'sw-valuelink'
import actions from 'redux/actions'
import { BigNumber } from 'bignumber.js'

import cssModules from 'react-css-modules'
import styles from './AddOffer.scss'

import Button from 'components/controls/Button/Button'

import Group from './Group/Group'
import Select from './Select/Select'

BigNumber.config({ DECIMAL_PLACES: 4, ROUNDING_MODE: 4, EXPONENTIAL_AT: [-7, 14], RANGE: 1e+7, CRYPTO: true })


@connect(({ user: { ethData, btcData, tokenData } }) => ({
  items: [ethData, btcData, tokenData]
}))
@cssModules(styles, { allowMultiple: true })
export default class AddOffer extends Component {

  constructor({ initialData }) {
    super()

    const { exchangeRate, buyAmount, sellAmount, buyCurrency, sellCurrency } = initialData || {}

    this.state = {
      exchangeRate: exchangeRate || config.exchangeRates.ethbtc,
      buyAmount: buyAmount || '',
      sellAmount: sellAmount || '',
      buyCurrency: buyCurrency || 'eth',
      sellCurrency: sellCurrency || 'btc',
      EventWasSend: false,
    }
  }

  getExchangeRate = (buyCurrency, sellCurrency) =>
    config.exchangeRates[`${buyCurrency.toLowerCase()}${sellCurrency.toLowerCase()}`]

  handleExchangeRateChange = (value) => {
    let { buyAmount, sellAmount } = this.state

    buyAmount = new BigNumber(String(buyAmount) || 0)
    sellAmount = buyAmount.multipliedBy(new BigNumber(String(value) || 0))

    this.setState({
      buyAmount,
      sellAmount,
    })
  }

  handleBuyCurrencySelect = ({ value }) => {
    let { buyCurrency, sellCurrency, buyAmount, sellAmount } = this.state

    // init:    buyCurrency = ETH, sellCurrency = BTC, value = BTC
    // result:  buyCurrency = BTC, sellCurrency = ETH
    if (value === sellCurrency) {
      sellCurrency = buyCurrency
    }

    buyCurrency = value

    const exchangeRate = this.getExchangeRate(buyCurrency, sellCurrency)

    if (buyAmount) {
      sellAmount = new BigNumber(String(buyAmount)).multipliedBy(exchangeRate).toNumber()
    }

    this.setState({
      exchangeRate,
      buyCurrency,
      sellCurrency,
      sellAmount,
    })
  }

  handleSellCurrencySelect = ({ value }) => {
    let { buyCurrency, sellCurrency, buyAmount, sellAmount } = this.state

    if (value === buyCurrency) {
      buyCurrency = sellCurrency
    }

    sellCurrency = value

    const exchangeRate = this.getExchangeRate(buyCurrency, sellCurrency)

    if (buyAmount) {
      sellAmount = new BigNumber(String(buyAmount)).multipliedBy(exchangeRate).toNumber()
    }

    this.setState({
      exchangeRate,
      buyCurrency,
      sellCurrency,
      sellAmount,
    })
  }

  handleBuyAmountChange = (value) => {
    const { exchangeRate } = this.state

    if (!this.EventWasSend) {
      actions.analytics.dataEvent('orderbook-addoffer-enter-ordervalue')
      this.EventWasSend = true
    }

    this.setState({
      sellAmount: new BigNumber(String(value) || 0).multipliedBy(exchangeRate).toNumber()
    })

  }

  handleSellAmountChange = (value) => {
    const { exchangeRate } = this.state

    if (!this.EventWasSend) {
      actions.analytics.dataEvent('orderbook-addoffer-enter-ordervalue')
      this.EventWasSend = true
    }

    this.setState({
      buyAmount: new BigNumber(String(value) || 0).dividedBy(exchangeRate).toNumber()
    })
  }

  handleNext = () => {
    const { exchangeRate, buyAmount, sellAmount, buyCurrency, sellCurrency } = this.state
    const forbidden = (`${buyCurrency}${sellCurrency}` === 'noxoneth') || (`${buyCurrency}${sellCurrency}` === 'ethnoxon')
    const { onNext } = this.props

    actions.analytics.dataEvent('orderbook-addoffer-click-next-button')

    const isDisabled = !exchangeRate || !buyAmount || !sellAmount || forbidden

    console.log(this.state)

    if (!isDisabled) {
      onNext(this.state)
    }
  }

  changeBalance = (value) => {
    this.setState({
      buyAmount: value,
    })
    this.handleBuyAmountChange(value)
  }

  componentWillMount() {
    actions.user.getBalances()
  }

  render() {
    const { items } = this.props
    const { exchangeRate, buyAmount, sellAmount, buyCurrency, sellCurrency } = this.state
    const forbidden = (`${buyCurrency}${sellCurrency}` === 'noxoneth') || (`${buyCurrency}${sellCurrency}` === 'ethnoxon')

    const linked = Link.all(this, 'exchangeRate', 'buyAmount', 'sellAmount')
    const isDisabled = !exchangeRate || forbidden || !buyAmount && !sellAmount
    const item = items.filter(item => item.currency.toLowerCase() === buyCurrency)

    return (
      <Fragment>
        <Group
          label="Exchange rate"
          inputValueLink={linked.exchangeRate.onChange(this.handleExchangeRateChange)}
          currency={false}
        />
        <Select
          changeBalance={this.changeBalance}
          balance={item[0].balance}
          currency={item[0].currency}
        />
        <Group
          styleName="buyGroup"
          label="Buy"
          inputValueLink={linked.buyAmount.onChange(this.handleBuyAmountChange)}
          selectedCurrencyValue={buyCurrency}
          onCurrencySelect={this.handleBuyCurrencySelect}
          id="Buy"
        />
        <Group
          label="Sell"
          inputValueLink={linked.sellAmount.onChange(this.handleSellAmountChange)}
          selectedCurrencyValue={sellCurrency}
          onCurrencySelect={this.handleSellCurrencySelect}
        />
        <Button
          styleName="button"
          fullWidth
          brand
          disabled={isDisabled}
          onClick={this.handleNext}
        >
          Next
        </Button>
      </Fragment>
    )
  }
}
