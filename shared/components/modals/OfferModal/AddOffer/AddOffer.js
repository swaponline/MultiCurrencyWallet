import React, { Fragment, Component } from 'react'

import { connect } from 'redaction'
import actions from 'redux/actions'

import Link from 'sw-valuelink'
import config from 'app-config'
import { constants } from 'helpers'

import { BigNumber } from 'bignumber.js'

import styles from './AddOffer.scss'
import cssModules from 'react-css-modules'

import Select from './Select/Select'
import ExchangeRateGroup from './ExchangeRateGroup/ExchangeRateGroup'
import SelectGroup from './SelectGroup/SelectGroup'

import Button from 'components/controls/Button/Button'


const minAmount = {
  eth: 0.05,
  btc: 0.004,
  noxon: 1,
  swap: 1,
  jot: 1,
}


@connect(({ currencies }) => ({
  currencies: currencies.items,
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
      ethBalance: null,
      isSending: false,
      isSellFieldInteger: false,
      isBuyFieldInteger: false
    }
  }

  componentWillMount() {
    const { sellCurrency } = this.state
    this.checkBalance(sellCurrency)
    this.handleCheckEthBalance()
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

  handleCheckEthBalance = async () => {
    const ethBalance = await actions.eth.getBalance()

    this.setState({
      ethBalance,
    })
  }

  checkBalance = async (sellCurrency) => {
    const balance = await actions[sellCurrency].getBalance(sellCurrency)
    this.handleCheckEthBalance()

    this.setState({
      balance,
    })
  }

  getExchangeRate = (sellCurrency, buyCurrency) => {
    actions.user.setExchangeRate(sellCurrency, buyCurrency, this.changeExchangeRate)
  }

  handleExchangeRateChange = (value) => {
    let { buyAmount, sellAmount } = this.state

    if (value == 0 || !value) { // eslint-disable-line
      buyAmount   = new BigNumber(0)
      sellAmount  = new BigNumber(0)
    } else {
      buyAmount  = new BigNumber(String(sellAmount) || 0).multipliedBy(value)
      sellAmount = new BigNumber(String(buyAmount) || 0).dividedBy(value)
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

    const isBuyFieldInteger = config.tokens[buyCurrency] && config.tokens[buyCurrency].decimals === 0

    if (isBuyFieldInteger)
      buyAmount = new BigNumber(String(buyAmount) || 0).dp(0, BigNumber.ROUND_HALF_EVEN)

    this.setState({
      buyCurrency,
      sellCurrency,
      sellAmount,
      buyAmount,
      isSellFieldInteger: config.tokens[sellCurrency] && config.tokens[sellCurrency].decimals === 0,
      isBuyFieldInteger,
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
    buyAmount = new BigNumber(String(sellAmount) || 0).dividedBy(exchangeRate)

    const isSellFieldInteger = config.tokens[sellCurrency] && config.tokens[sellCurrency].decimals === 0

    if (isSellFieldInteger)
      sellAmount = new BigNumber(String(sellAmount) || 0).dp(0, BigNumber.ROUND_HALF_EVEN)


    this.setState({
      buyCurrency,
      sellCurrency,
      buyAmount,
      sellAmount,
      isSellFieldInteger,
      isBuyFieldInteger: config.tokens[buyCurrency] && config.tokens[buyCurrency].decimals === 0,
    })
  }

  handleBuyAmountChange = (value) => {
    const { exchangeRate } = this.state

    if (!this.isSending) {
      actions.analytics.dataEvent('orderbook-addoffer-enter-ordervalue')
      this.setState({ isSending: true })
    }

    this.setState({
      sellAmount: new BigNumber(String(value) || 0).dividedBy(exchangeRate || 0),
      buyAmount: new BigNumber(String(value)),
    })
  }

  handleSellAmountChange = (value) => {
    const { exchangeRate } = this.state

    if (!this.isSending) {
      actions.analytics.dataEvent('orderbook-addoffer-enter-ordervalue')
      this.setState({ isSending: true })
    }

    this.setState({
      buyAmount: new BigNumber(String(value) || 0).multipliedBy(exchangeRate || 0),
      sellAmount: new BigNumber(String(value)),
    })
  }

  handleNext = () => {
    const { exchangeRate, buyAmount, sellAmount, balance, sellCurrency, ethBalance } = this.state
    const { onNext } = this.props

    const isDisabled = !exchangeRate || !buyAmount || !sellAmount || sellAmount > balance || sellAmount < minAmount[sellCurrency]
      || ethBalance < 0.02

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
    const { currencies } = this.props
    const { exchangeRate, buyAmount, sellAmount, buyCurrency, sellCurrency, balance, isBuyFieldInteger, isSellFieldInteger, ethBalance } = this.state
    const linked = Link.all(this, 'exchangeRate', 'buyAmount', 'sellAmount')
    const isDisabled = !exchangeRate || !buyAmount && !sellAmount
      || sellAmount > balance || sellAmount < minAmount[sellCurrency]
      || ethBalance < 0.02

    linked.sellAmount.check((value) => value > minAmount[sellCurrency], `Amount must be greater than ${minAmount[sellCurrency]} `)
    linked.sellAmount.check((value) => value <= balance, `Amount must be bigger your balance`)

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
          changeBalance={this.changeBalance}
          balance={balance}
          currency={sellCurrency}
        />
        { ethBalance <= 0.02 && <span styleName="error">For a swap, you need 0.02 ETH on your balance</span> }
        <SelectGroup
          styleName="sellGroup"
          label="Sell"
          inputValueLink={linked.sellAmount.onChange(this.handleSellAmountChange)}
          selectedCurrencyValue={sellCurrency}
          onCurrencySelect={this.handleSellCurrencySelect}
          id="sellAmount"
          currencies={currencies}
          isInteger={isSellFieldInteger}
          placeholder="Enter sell amount"
        />
        <SelectGroup
          label="Buy"
          inputValueLink={linked.buyAmount.onChange(this.handleBuyAmountChange)}
          selectedCurrencyValue={buyCurrency}
          onCurrencySelect={this.handleBuyCurrencySelect}
          id="buyAmount"
          currencies={currencies}
          isInteger={isBuyFieldInteger}
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
