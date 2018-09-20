import React, { Fragment, Component } from 'react'

import { connect } from 'redaction'
import actions from 'redux/actions'

import Link from 'sw-valuelink'
import config from 'app-config'

import { BigNumber } from 'bignumber.js'

import styles from './AddOffer.scss'
import cssModules from 'react-css-modules'

import Select from './Select/Select'
import ExchangeRateGroup from './ExchangeRateGroup/ExchangeRateGroup'
import SelectGroup from './SelectGroup/SelectGroup'

import Button from 'components/controls/Button/Button'
import Toggle from 'components/controls/Toggle/Toggle'

import { areFloatsEqual } from 'helpers/math.js'


const minAmount = {
  eth: 0.05,
  btc: 0.004,
  eos: 1,
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
      exchangeRate: exchangeRate || 1,
      buyAmount: buyAmount || '',
      sellAmount: sellAmount || '',
      buyCurrency: buyCurrency || 'btc',
      sellCurrency: sellCurrency || 'eth',
      ethBalance: null,
      isSending: false,
      balance: null,
      isSellFieldInteger: false,
      isBuyFieldInteger: false,
      manualRate: false,
    }
  }

  componentDidMount() {
    const { sellCurrency, buyCurrency } = this.state
    this.checkBalance(sellCurrency)
    this.updateExchangeRate(sellCurrency, buyCurrency)
  }

  checkBalance = async (sellCurrency) => {
    const balance = await actions[sellCurrency].getBalance(sellCurrency)
    const ethBalance = await actions.eth.getBalance()

    this.setState({
      balance,
      ethBalance,
    })
  }

  async updateExchangeRate(sellCurrency, buyCurrency) {
    const exchangeRate = await actions.user.getExchangeRate(sellCurrency, buyCurrency)
    return new Promise((resolve, reject) => {
      this.setState({ exchangeRate }, () => resolve())
    })
  }

  handleExchangeRateChange = (value) => {
    let { buyAmount, sellAmount } = this.state

    if (areFloatsEqual(value, 0) || value.lastIndexOf(0, '.') || !value) {
      return
    }


    buyAmount  = new BigNumber(Number(sellAmount)).multipliedBy(value)
    sellAmount = new BigNumber(Number(buyAmount)).dividedBy(value)

    this.setState({
      buyAmount,
      sellAmount,
    })
  }

  handleBuyCurrencySelect = async ({ value }) => {
    let { buyCurrency, sellCurrency, buyAmount, sellAmount } = this.state

    if (value === sellCurrency) {
      sellCurrency = buyCurrency
    }

    buyCurrency = value

    this.checkBalance(sellCurrency)

    await this.updateExchangeRate(sellCurrency, buyCurrency)
    const { exchangeRate } = this.state
    sellAmount = new BigNumber(String(buyAmount) || 0).multipliedBy(exchangeRate)

    const isBuyFieldInteger = config.erc20[buyCurrency] && config.erc20[buyCurrency].decimals === 0

    if (isBuyFieldInteger) {
      buyAmount = new BigNumber(String(buyAmount) || 0).dp(0, BigNumber.ROUND_HALF_EVEN)
    }
    this.setState({
      buyCurrency,
      sellCurrency,
      sellAmount: Number.isNaN(sellAmount) ? '' : sellAmount,
      buyAmount: Number.isNaN(buyAmount) ? '' : buyAmount,
      isSellFieldInteger: config.erc20[sellCurrency] && config.erc20[sellCurrency].decimals === 0,
      isBuyFieldInteger,
    })
  }

  handleSellCurrencySelect = async ({ value }) => {
    let { buyCurrency, sellCurrency, sellAmount, buyAmount } = this.state

    if (value === buyCurrency) {
      buyCurrency = sellCurrency
    }

    sellCurrency = value

    this.checkBalance(sellCurrency)
    await this.updateExchangeRate(sellCurrency, buyCurrency)
    const { exchangeRate } = this.state
    buyAmount = new BigNumber(String(sellAmount) || 0).multipliedBy(exchangeRate)

    const isSellFieldInteger = config.erc20[sellCurrency] && config.erc20[sellCurrency].decimals === 0

    if (isSellFieldInteger) {
      sellAmount = new BigNumber(String(sellAmount) || 0).dp(0, BigNumber.ROUND_HALF_EVEN)
    }

    this.setState({
      buyCurrency,
      sellCurrency,
      buyAmount: Number.isNaN(buyAmount) ? '' : buyAmount,
      sellAmount: Number.isNaN(sellAmount) ? '' : sellAmount,
      isSellFieldInteger,
      isBuyFieldInteger: config.erc20[buyCurrency] && config.erc20[buyCurrency].decimals === 0,
    })
  }

  handleBuyAmountChange = (value, prev) => {
    const { exchangeRate, sellAmount, manualRate } = this.state

    const firstDot = value.indexOf('.')
    const secondDot = value.lastIndexOf('.')

    if (firstDot !== secondDot) {
      return undefined
    }

    if (!this.isSending) {
      actions.analytics.dataEvent('orderbook-addoffer-enter-ordervalue')
      this.setState({ isSending: true })
    }

    if (manualRate) {
      let newRate = new BigNumber(String(value)).dividedBy(new BigNumber(String(sellAmount)))
      this.setState({
        exchangeRate: Number.isNaN(newRate) ? '' : newRate,
        buyAmount: new BigNumber(String(value)),
      })
    } else {
      this.setState({
        sellAmount: new BigNumber(String(value) || 0).dividedBy(exchangeRate || 0),
        buyAmount: new BigNumber(String(value)),
      })
    }


    return value
  }

  handleSellAmountChange = (value) => {
    const { exchangeRate, manualRate, buyAmount } = this.state
    const firstDot = value.toString().indexOf('.')
    const secondDot = value.toString().lastIndexOf('.')

    if (firstDot !== secondDot) {
      return undefined
    }

    if (!this.isSending) {
      actions.analytics.dataEvent('orderbook-addoffer-enter-ordervalue')
      this.setState({ isSending: true })
    }
    if (manualRate) {
      let newRate = new BigNumber(String(buyAmount)).dividedBy(new BigNumber(String(value)))
      this.setState({
        sellAmount: new BigNumber(String(value)),
        exchangeRate: Number.isNaN(newRate) ? '' : newRate,
      })
    } else {
      this.setState({
        sellAmount: new BigNumber(String(value)),
        buyAmount: new BigNumber(String(value) || 0).multipliedBy(exchangeRate || 0),
      })
    }


    return value
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

  handleManualRate = (value) => {
    if (!value) {
      this.handleSellCurrencySelect({ value:this.state.sellCurrency })
    }
    this.setState({ manualRate: value })
  }

  render() {
    const { currencies } = this.props
    const { exchangeRate, buyAmount, sellAmount, buyCurrency, sellCurrency,
      balance, isBuyFieldInteger, isSellFieldInteger, ethBalance, manualRate } = this.state
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
          disabled={!manualRate}
          id="exchangeRate"
          placeholder="Enter exchange rate amount"
          buyCurrency={buyCurrency}
          sellCurrency={sellCurrency}
        />
        <div>
          <Toggle checked={manualRate} onChange={this.handleManualRate} /> Custom exchange rate
        </div>
        <Select
          changeBalance={this.changeBalance}
          balance={balance}
          currency={sellCurrency}
        />
        { ethBalance < 0.02 && <span styleName="error">For a swap, you need 0.02 ETH on your balance</span> }
        <SelectGroup
          styleName="sellGroup"
          label="Sell"
          inputValueLink={linked.sellAmount.pipe(this.handleSellAmountChange)}
          selectedCurrencyValue={sellCurrency}
          onCurrencySelect={this.handleSellCurrencySelect}
          id="sellAmount"
          currencies={currencies}
          isInteger={isSellFieldInteger}
          placeholder="Enter sell amount"
        />
        <SelectGroup
          label="Buy"
          inputValueLink={linked.buyAmount.pipe(this.handleBuyAmountChange)}
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
