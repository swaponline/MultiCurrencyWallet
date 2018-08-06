import React, { Fragment, Component } from 'react'
import { connect } from 'redaction'
import config from 'app-config'

import Link from 'sw-valuelink'
import actions from 'redux/actions'
import { BigNumber } from 'bignumber.js'

import cssModules from 'react-css-modules'
import styles from './AddOffer.scss'

import Button from 'components/controls/Button/Button'

import Select from './Select/Select'
import ExchangeRateGroup from './ExchangeRateGroup/ExchangeRateGroup'
import SelectGroup from './SelectGroup/SelectGroup'


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
      buyCurrency: buyCurrency || 'btc',
      sellCurrency: sellCurrency || 'eth',
      EventWasSend: false,
      min: 0.05,
    }
  }

  componentWillMount() {
    this.checkBalance('eth')
  }

  componentDidMount() {
    const { sellCurrency, buyCurrency } = this.state
    this.getExchangeRate(sellCurrency, buyCurrency)
  }

  changeExchangeRate = (value) => {
    this.setState({
      exchangeRate: value,
    })
  }

  checkBalance = async (sellCurrency) => {
    const balance = await actions[sellCurrency].getBalance()

    this.setState({
      balance,
    })
  }

  getExchangeRate = (sellCurrency, buyCurrency) => {
    actions.user.setExchangeRate(sellCurrency, buyCurrency, this.changeExchangeRate)
  }


  handleExchangeRateChange = (value) => {
    let { buyAmount, sellAmount } = this.state

    sellAmount = new BigNumber(String(sellAmount) || 0)

    if (value === 0 || !value) {
      buyAmount = new BigNumber(String(0))
    } else {
      buyAmount = sellAmount.dividedBy(new BigNumber(String(value)))
    }

    this.setState({
      buyAmount,
      sellAmount,
    })
  }

  handleBuyCurrencySelect = ({ value }) => {
    let { buyCurrency, sellCurrency, buyAmount, sellAmount } = this.state

    if (value === sellCurrency) {
      sellCurrency = buyCurrency
    }

    buyCurrency = value

    this.checkBalance(sellCurrency)
    this.getExchangeRate(sellCurrency, buyCurrency)

    const { exchangeRate } = this.state
    sellAmount = new BigNumber(String(buyAmount) || 0).multipliedBy(exchangeRate)


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

    this.checkBalance(sellCurrency)
    this.getExchangeRate(sellCurrency, buyCurrency)

    const { exchangeRate } = this.state
    buyAmount = new BigNumber(String(sellAmount) || 0).multipliedBy(exchangeRate)


    this.setState({
      buyCurrency,
      sellCurrency,
      buyAmount,
    })
  }

  handleBuyAmountChange = (value) => {
    const { exchangeRate, buyAmount } = this.state

    if (!this.EventWasSend) {
      actions.analytics.dataEvent('orderbook-addoffer-enter-ordervalue')
      this.EventWasSend = true
    }

    this.setState({
      sellAmount: new BigNumber(String(value) || 0).multipliedBy(exchangeRate),
      buyAmount: new BigNumber(String(buyAmount)),
    })
  }

  handleSellAmountChange = (value) => {
    const { exchangeRate, sellAmount } = this.state

    if (!this.EventWasSend) {
      actions.analytics.dataEvent('orderbook-addoffer-enter-ordervalue')
      this.EventWasSend = true
    }

    this.setState({
      buyAmount: new BigNumber(String(value) || 0).multipliedBy(exchangeRate),
      sellAmount: new BigNumber(String(sellAmount)),
    })
  }

  handleNext = () => {
    const { exchangeRate, buyAmount, sellAmount, balance, min } = this.state
    const { onNext } = this.props

    const isDisabled = !exchangeRate || !buyAmount || !sellAmount || sellAmount > balance || sellAmount < min

    if (!isDisabled) {
      actions.analytics.dataEvent('orderbook-addoffer-click-next-button')
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
    const { exchangeRate, buyAmount, sellAmount, buyCurrency, sellCurrency, balance, min } = this.state

    const linked = Link.all(this, 'exchangeRate', 'buyAmount', 'sellAmount')

    if (sellCurrency === 'btc') {
      linked.sellAmount.check((value) => value > 0.004, `Amount must be greater than 0.004 `)
    } else {
      linked.sellAmount.check((value) => value > min, `Amount must be greater than ${min} `)
    }

    linked.sellAmount.check((value) => value < balance, `Amount must be bigger your balance`)

    const isDisabled = !exchangeRate || !buyAmount && !sellAmount || sellAmount > balance || sellAmount < min
    const data = [].concat(tokens, items).filter(item => item.currency.toLowerCase() === `${sellCurrency}`)

    return (
      <Fragment>
        <ExchangeRateGroup
          label="Exchange rate"
          inputValueLink={linked.exchangeRate.onChange(this.handleExchangeRateChange)}
          currency={false}
          id="exchangeRate"
          placeholder="Enter exchange rate amount"
          buyCurrency={buyCurrency}
          sellCurrency={sellCurrency}
        />
        <Select
          label="Available amount"
          changeBalance={this.changeBalance}
          balance={data[0].balance}
          currency={data[0].currency}
        />
        <SelectGroup
          styleName="sellGroup"
          label="Sell"
          inputValueLink={linked.sellAmount.onChange(this.handleSellAmountChange)}
          selectedCurrencyValue={sellCurrency}
          onCurrencySelect={this.handleSellCurrencySelect}
          id="sellAmount"
          placeholder="Enter sell amount"
        />
        <SelectGroup
          label="Buy"
          inputValueLink={linked.buyAmount.onChange(this.handleBuyAmountChange)}
          selectedCurrencyValue={buyCurrency}
          onCurrencySelect={this.handleBuyCurrencySelect}
          id="buyAmount"
          placeholder="Enter buy amount"
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
