import React, { Component } from 'react'

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
import Tooltip from 'components/ui/Tooltip/Tooltip'
import { FormattedMessage } from 'react-intl'

import { isNumberValid, isNumberStringFormatCorrect, mathConstants } from 'helpers/math.js'


const minAmount = {
  eth: 0.05,
  btc: 0.004,
  ltc: 0.1,
  eos: 1,
  noxon: 1,
  swap: 1,
  jot: 1,
}


@connect(
  ({
    currencies,
    user: { ethData, btcData, bchData, tokensData, eosData, telosData, nimData, usdtData, ltcData },
  }) => ({
    currencies: currencies.items,
    items: [ ethData, btcData, eosData, telosData, bchData, ltcData, usdtData /* nimData */ ],
    tokenItems: [ ...Object.keys(tokensData).map(k => (tokensData[k])) ],
  })
)
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
      isPartialClosure: false,
    }
  }

  componentDidMount() {
    const { sellCurrency, buyCurrency } = this.state
    this.checkBalance(sellCurrency)
    this.updateExchangeRate(sellCurrency, buyCurrency)
  }

  checkBalance = async (sellCurrency) => {
    await actions[sellCurrency].getBalance(sellCurrency)

    const { items, tokenItems } = this.props

    const currency = items.concat(tokenItems)
      .filter(item => item.currency === sellCurrency.toUpperCase())[0]

    const sleep = time => new Promise(resolve => setTimeout(resolve, time))

    const { balance, unconfirmedBalance } = currency
    const finalBalance = unconfirmedBalance !== undefined && unconfirmedBalance < 0
      ? Number(balance) + Number(unconfirmedBalance)
      : balance
    const ethBalance = await actions.eth.getBalance()

    this.setState({
      balance: finalBalance,
      ethBalance,
    })
  }

  async updateExchangeRate(sellCurrency, buyCurrency) {
    const exchangeRate = await actions.user.getExchangeRate(sellCurrency, buyCurrency)


    return new Promise((resolve, reject) => {
      this.setState({ exchangeRate }, () => resolve())
    })
  }

  handleBuyCurrencySelect = async ({ value }) => {
    let { buyCurrency, sellCurrency, buyAmount, sellAmount } = this.state

    if (value === sellCurrency) {
      sellCurrency = buyCurrency
    }

    buyCurrency = value

    await this.checkBalance(sellCurrency)

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

    await this.checkBalance(sellCurrency)
    
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

  handleExchangeRateChange = (value) => {
    let { buyAmount, sellAmount } = this.state

    if (!isNumberStringFormatCorrect(value)) {
      return undefined
    }

    // if (areFloatsEqual(value, 0) || !value) {
    //   return undefined
    // }

    this.handleAnyChange({
      type: 'rate',
      value,
    })

    return value
  }

  handleBuyAmountChange = (value, prev) => {
    const { exchangeRate, sellAmount, manualRate } = this.state

    if (!isNumberStringFormatCorrect(value)) {
      return undefined
    }

    this.handleAnyChange({
      type: 'buy',
      value,
    })

    return value
  }

  handleSellAmountChange = (value) => {
    const { exchangeRate, buyAmount } = this.state

    if (!isNumberStringFormatCorrect(value)) {
      return undefined
    }

    this.handleAnyChange({
      type: 'sell',
      value,
    })

    return value
  }

  handleAnyChange = ({ type, value }) => {
    const { manualRate, exchangeRate, buyAmount, sellAmount } = this.state

    if (type === 'sell' || type === 'buy') {
      if (!this.isSending) {
        actions.analytics.dataEvent('orderbook-addoffer-enter-ordervalue')
        this.setState({ isSending: true })
      }
    }

    /*
        XR = S / B
        B = S / XR
        S = XR * B
    */

    switch (type) {
      case 'sell':  {
        /*
          S++ -> XR++ -> B (Manual Rate)
          S++ -> XR -> B++ (Auto Rate)
        */

        if (manualRate) {
          let newExchangeRate = new BigNumber(String(value)).dividedBy(new BigNumber(String(buyAmount)))
          this.setState({
            exchangeRate: isNumberValid(newExchangeRate) ? newExchangeRate : '',
            sellAmount: new BigNumber(String(value)),
          })
        } else {
          this.setState({
            sellAmount: new BigNumber(String(value)),
            buyAmount: new BigNumber(String(value) || 0).multipliedBy(exchangeRate || 0),
          })
        }
        break
      }

      case 'buy':  {
        /*
          B++ -> XR-- -> S (Manual Rate)
          B++ -> XR -> S++ (Auto Rate)
        */

        if (manualRate) {
          let newExchangeRate = new BigNumber(String(sellAmount)).dividedBy(new BigNumber(String(value)))
          this.setState({
            exchangeRate: isNumberValid(newExchangeRate) ? newExchangeRate : '',
            buyAmount: new BigNumber(String(value)),
          })
        } else {
          this.setState({
            sellAmount: new BigNumber(String(value) || 0).dividedBy(exchangeRate || 0),
            buyAmount: new BigNumber(String(value)),
          })
        }

        break
      }

      case 'rate': {
        if (sellAmount > mathConstants.high_precision) {
          // If user has set sell value change buy value
          /*
            XR++ -> S -> B--
          */

          let newBuyAmount  = new BigNumber(String(sellAmount)).dividedBy(value)

          if (!isNumberValid(newBuyAmount)) {
            newBuyAmount = new BigNumber('0')
          }

          this.setState({
            buyAmount: newBuyAmount,
          })
        } else {
          // Otherwise change sell value if buy value is not null
          /*
            XR++ -> S++ -> B
          */

          let newSellAmount = new BigNumber(String(value)).multipliedBy(buyAmount)

          if (!isNumberValid(newSellAmount)) {
            newSellAmount = new BigNumber('0')
          }

          this.setState({
            sellAmount: newSellAmount,
          })
        }

        break
      }
      default:
        console.error('Unknown type')
        break
    }
  }

  isEthOrERC20() {
    const { tokenItems } = this.props
    const { buyCurrency, sellCurrency, ethBalance } = this.state

    return (
      sellCurrency === 'eth' || buyCurrency === 'eth' || tokenItems.find(
        (item) => item.name === sellCurrency || item.name === buyCurrency
      ) !== undefined
    ) ? ethBalance < minAmount.eth : false
  }

  handleNext = () => {
    const { exchangeRate, buyAmount, sellAmount, balance, sellCurrency, ethBalance } = this.state
    const { onNext, tokenItems } = this.props

    const isDisabled = !exchangeRate || !buyAmount || !sellAmount || sellAmount > balance || sellAmount < minAmount[sellCurrency]
      || this.isEthOrERC20()

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
    const { currencies, tokenItems } = this.props
    const { exchangeRate, buyAmount, sellAmount, buyCurrency, sellCurrency,
      balance, isBuyFieldInteger, isSellFieldInteger, ethBalance, manualRate, isPartialClosure } = this.state
    const linked = Link.all(this, 'exchangeRate', 'buyAmount', 'sellAmount')
    const isDisabled = !exchangeRate || !buyAmount && !sellAmount
      || sellAmount > balance || sellAmount < minAmount[sellCurrency]
      || this.isEthOrERC20()

    linked.sellAmount.check((value) => value > minAmount[sellCurrency], `Amount must be greater than ${minAmount[sellCurrency]} `)
    linked.sellAmount.check((value) => value <= balance, `Amount must be bigger than on your balance`)

    console.log('this state', isPartialClosure)

    return (
      <div styleName="wrapper">
        { this.isEthOrERC20() &&
          <span styleName="error">
            <FormattedMessage id="transaction27" defaultMessage="For a swap, you need" />
            {minAmount.eth}
            <FormattedMessage id="transaction27" defaultMessage="ETH on your balance" />
          </span>
        }
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
        <Select
          changeBalance={this.changeBalance}
          balance={balance}
          currency={sellCurrency}
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
        <div>
          <ExchangeRateGroup
            label="Exchange rate"
            inputValueLink={linked.exchangeRate.pipe(this.handleExchangeRateChange)}
            currency={false}
            disabled={!manualRate}
            id="exchangeRate"
            placeholder="Enter exchange rate amount"
            buyCurrency={buyCurrency}
            sellCurrency={sellCurrency}
          />
        </div>
        <div>
          <Toggle checked={manualRate} onChange={this.handleManualRate} /> Custom exchange rate
          <Tooltip text="To change the exchange rate" />
        </div>
        <div>
          <Toggle checked={isPartialClosure} onChange={() => this.setState((state) => ({ isPartialClosure: !state.isPartialClosure }))} /> Enabled to partial closure
          <Tooltip text="To change the exchange rate" />
        </div>
        <Button styleName="button" fullWidth brand disabled={isDisabled} onClick={this.handleNext}>
          <FormattedMessage id="AddOffer396" defaultMessage="Next" />
        </Button>
      </div>
    )
  }
}
