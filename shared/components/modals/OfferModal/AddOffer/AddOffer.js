import React, { Fragment, Component } from 'react'
import { connect } from 'redaction'
import config from 'app-config'
import { request } from 'helpers'

import Link from 'sw-valuelink'
import actions from 'redux/actions'
import { BigNumber } from 'bignumber.js'

import cssModules from 'react-css-modules'
import styles from './AddOffer.scss'

import Button from 'components/controls/Button/Button'

import Group from './Group/Group'
import Select from './Select/Select'


BigNumber.config({ DECIMAL_PLACES: 4, ROUNDING_MODE: 4, EXPONENTIAL_AT: [-7, 14], RANGE: 1e+7, CRYPTO: true })

@connect(({ user: { ethData, btcData, tokensData } }) => ({
  items: [ethData, btcData ],
  tokens: Object.keys(tokensData).map(k => (tokensData[k])),
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

  componentWillMount() {
    actions.user.getBalances()
  }

  componentDidMount() {
    const { buyCurrency, sellCurrency } = this.state
    this.getExchangeRate(buyCurrency, sellCurrency)
  }

  changeExchangeRate = (value) => {
    this.setState({
      exchangeRate: value,
    })
  }

  getExchangeRate = (buyCurrency, sellCurrency) => {
    actions.user.setExchangeRate(buyCurrency, sellCurrency, this.changeExchangeRate)
  }


  handleExchangeRateChange = (value) => {
    let { buyAmount, sellAmount } = this.state

    buyAmount = new BigNumber(String(buyAmount) || 0)
    sellAmount = buyAmount.multipliedBy(new BigNumber(String(value) || 0))

    this.setState({
      buyAmount: buyAmount.toNumber(),
      sellAmount: sellAmount.toNumber(),
    })
  }

  handleBuyCurrencySelect = ({ value }) => {
    let { buyCurrency, sellCurrency, buyAmount, sellAmount } = this.state

    if (value === sellCurrency) {
      sellCurrency = buyCurrency
    }

    buyCurrency = value

    this.getExchangeRate(buyCurrency, sellCurrency)

    const { exchangeRate } = this.state

    sellAmount = new BigNumber(String(buyAmount) || 0).dividedBy(exchangeRate)


    this.setState({
      buyCurrency,
      sellCurrency,
      sellAmount,
    })
  }

  handleSellCurrencySelect = ({ value }) => {
    let { buyCurrency, sellCurrency, sellAmount, buyAmount } = this.state

    if (value === buyCurrency) {
      buyCurrency = sellCurrency
    }

    sellCurrency = value
    this.getExchangeRate(buyCurrency, sellCurrency)

    const { exchangeRate } = this.state

    buyAmount = new BigNumber(String(sellAmount) || 0).multipliedBy(exchangeRate)


    this.setState({
      buyCurrency,
      sellCurrency,
      buyAmount,
    })
  }

  handleBuyAmountChange = (value) => {
    const { exchangeRate } = this.state

    if (!this.EventWasSend) {
      actions.analytics.dataEvent('orderbook-addoffer-enter-ordervalue')
      this.EventWasSend = true
    }

    this.setState({
      sellAmount: new BigNumber(String(value) || 0).multipliedBy(exchangeRate).toNumber(),
    })
  }

  handleSellAmountChange = (value) => {
    const { exchangeRate } = this.state

    if (!this.EventWasSend) {
      actions.analytics.dataEvent('orderbook-addoffer-enter-ordervalue')
      this.EventWasSend = true
    }

    this.setState({
      buyAmount: new BigNumber(String(value) || 0).dividedBy(exchangeRate).toNumber(),
    })
  }

  handleNext = () => {
    const { exchangeRate, buyAmount, sellAmount } = this.state
    const { onNext } = this.props

    actions.analytics.dataEvent('orderbook-addoffer-click-next-button')

    const isDisabled = !exchangeRate || !buyAmount || !sellAmount

    if (!isDisabled) {
      onNext(this.state)
    }
  }

  changeBalance = (value) => {
    this.setState({
      sellAmount: value,
    })
    this.handleSellAmountChange(value)
  }

  render() {
    const { items, tokens } = this.props
    const { exchangeRate, buyAmount, sellAmount, buyCurrency, sellCurrency } = this.state

    const linked = Link.all(this, 'exchangeRate', 'buyAmount', 'sellAmount')
    const isDisabled = !exchangeRate || !buyAmount && !sellAmount

    const data = [].concat(tokens, items).filter(item => item.currency.toLowerCase() === `${sellCurrency}`)


    return (
      <Fragment>
        <Group
          label="Exchange rate"
          inputValueLink={linked.exchangeRate.onChange(this.handleExchangeRateChange)}
          currency={false}
          id="exchangeRate"
        />
        <Select
          changeBalance={this.changeBalance}
          balance={data[0].balance}
          currency={data[0].currency}
        />
        <Group
          styleName="sellGroup"
          label="Sell"
          inputValueLink={linked.sellAmount.onChange(this.handleSellAmountChange)}
          selectedCurrencyValue={sellCurrency}
          onCurrencySelect={this.handleSellCurrencySelect}
          id="sellAmount"
        />
        <Group
          label="Buy"
          inputValueLink={linked.buyAmount.onChange(this.handleBuyAmountChange)}
          selectedCurrencyValue={buyCurrency}
          onCurrencySelect={this.handleBuyCurrencySelect}
          id="buyAmount"
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
