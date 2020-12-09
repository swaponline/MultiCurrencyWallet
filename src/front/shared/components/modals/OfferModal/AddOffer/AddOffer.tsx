import React, { Component } from 'react'

import { connect } from 'redaction'
import actions from 'redux/actions'
import helpers, { constants } from 'helpers'

import Link from 'local_modules/sw-valuelink'
import config from 'app-config'

import { BigNumber } from 'bignumber.js'

import styles from './AddOffer.scss'
import cssModules from 'react-css-modules'

import Select from './Select/Select'
import ExchangeRateGroup from './ExchangeRateGroup/ExchangeRateGroup'
import SelectGroup from './SelectGroup/SelectGroup'

import Button from 'components/controls/Button/Button'
import Toggle from 'components/controls/Toggle/Toggle'
import Input from 'components/forms/Input/Input'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import { FormattedMessage } from 'react-intl'
import minAmountOffer from 'helpers/constants/minAmountOffer'
import coinsWithDynamicFee from 'helpers/constants/coinsWithDynamicFee'


const mathConstants = {
  high_precision: 10e-8,
  low_precision: 10e-5,
}

const isNumberStringFormatCorrect = number => {
  const stringified = String(number)

  const firstDotIndex = stringified.indexOf('.')
  const lastDotIndex = stringified.lastIndexOf('.')

  // first and last dot positions match, so it has only one dot
  return firstDotIndex === lastDotIndex
}


const isDark = localStorage.getItem(constants.localStorage.isDark)
@connect(
  ({
    currencies,
    addSelectedItems,
    user: { ethData, btcData, ghostData, nextData, tokensData },
  }) => ({
    currencies: currencies.items,
    addSelectedItems: currencies.addSelectedItems,
    items: [ethData, btcData, ghostData, nextData],
    tokenItems: [...Object.keys(tokensData).map(k => (tokensData[k]))],
  })
)
@cssModules(styles, { allowMultiple: true })
export default class AddOffer extends Component<any, any> {

  isSending: any

  constructor({ items, tokenItems, initialData }) {
    //@ts-ignore
    super()

    if (config && config.isWidget) {
      if (window.widgetERC20Tokens && Object.keys(window.widgetERC20Tokens).length) {
        Object.keys(window.widgetERC20Tokens).forEach((key) => {
          minAmountOffer[key] = 1
        })
      } else {
        minAmountOffer[config.erc20token] = 1
      }
    }

    //@ts-ignore
    const { exchangeRate, buyAmount, sellAmount, buyCurrency, sellCurrency } = initialData || {}

    this.state = {
      balance: null,
      isTokenSell: false,
      isTokenBuy: false,
      isPartial: true,
      isSending: false,
      manualRate: true,
      buyAmount: buyAmount || '',
      sellAmount: sellAmount || '',
      exchangeRate: exchangeRate || 1,
      buyCurrency: buyCurrency || 'btc',
      sellCurrency: sellCurrency || 'eth',
      minimalestAmountForBuy: minAmountOffer[buyCurrency] || minAmountOffer.btc,
      minimalestAmountForSell: minAmountOffer[sellCurrency] || minAmountOffer.eth,
    }
  }

  componentDidMount() {
    const { sellCurrency, buyCurrency, value } = this.state

    actions.pairs.selectPair(sellCurrency)
    //@ts-ignore
    this.checkBalance(sellCurrency)
    this.updateExchangeRate(sellCurrency, buyCurrency)
    this.isEthToken(sellCurrency, buyCurrency)
    this.getFee()
  }

  getFee = () => {
    const { sellCurrency, buyCurrency } = this.state

    this.correctMinAmountSell(sellCurrency)
    this.correctMinAmountBuy(buyCurrency)
  }

  checkBalance = async (sellCurrency, buyCurrency) => {
    await actions[sellCurrency].getBalance(sellCurrency)

    const { items, tokenItems } = this.props

    const currency = items.concat(tokenItems)
      .filter(item => item.currency === sellCurrency.toUpperCase())[0]

    let { balance, unconfirmedBalance } = currency

    balance = new BigNumber(balance)
    unconfirmedBalance = new BigNumber(unconfirmedBalance)

    const currentBalance = unconfirmedBalance.isNaN() && unconfirmedBalance.isLessThan(0)
      ? balance.plus(unconfirmedBalance)
      : balance

    const balanceWithoutFee = (helpers.ethToken.isEthToken({ name: this.state.sellCurrency }))
      ? currentBalance
      : currentBalance.minus(this.state.minimalestAmountForSell)

    const finalBalance = balanceWithoutFee.isGreaterThan(0) ? balanceWithoutFee : new BigNumber(0)

    this.setState({
      balance: finalBalance.toString(),
    })
  }

  isEthToken = (sellCurrency, buyCurrency) => {
    const isTokenSell = helpers.ethToken.isEthToken({ name: sellCurrency })
    const isTokenBuy = helpers.ethToken.isEthToken({ name: buyCurrency })

    this.setState(() => ({
      isTokenBuy,
      isTokenSell,
    }))
  }

  correctMinAmountSell = async (sellCurrency) => {
    if (coinsWithDynamicFee.includes(sellCurrency) && !helpers.ethToken.isEthToken({ name: sellCurrency })) {
      const minimalestAmountForSell = await helpers[sellCurrency].estimateFeeValue({ method: 'swap', speed: 'fast' })
      this.setState({
        minimalestAmountForSell,
      })
    }
  }

  correctMinAmountBuy = async (buyCurrency) => {
    if (coinsWithDynamicFee.includes(buyCurrency)) {
      const minimalestAmountForBuy = await helpers[buyCurrency].estimateFeeValue({ method: 'swap', speed: 'fast' })
      this.setState({
        minimalestAmountForBuy,
      })
    }
  }

  updateExchangeRate = async (sellCurrency, buyCurrency) => {
    const exchangeRateSell: any = await actions.user.getExchangeRate(sellCurrency, 'usd')
    const exchangeRateBuy: any = await actions.user.getExchangeRate(buyCurrency, 'usd')

    const exchangeRate = sellCurrency === 'swap' || buyCurrency === 'swap'
      ? await actions.user.getExchangeRate(sellCurrency, buyCurrency)
      : new BigNumber(exchangeRateSell).div(exchangeRateBuy).dp(4, BigNumber.ROUND_CEIL)

    return new Promise((resolve, reject) => {
      this.setState({ exchangeRate }, () => resolve())
    })
  }

  handleBuyCurrencySelect = async ({ value }) => {
    const { buyCurrency, sellCurrency, buyAmount, sellAmount } = this.state

    if (sellCurrency === value) {
      this.switching()
    } else {
      this.checkPair(sellCurrency)
      //@ts-ignore
      await this.checkBalance(sellCurrency)
      await this.updateExchangeRate(sellCurrency, value)

      this.setState(() => ({
        buyCurrency: value,
      }))

      if (sellAmount > 0 || buyAmount > 0) {
        this.handleBuyAmountChange(buyAmount)
        this.handleSellAmountChange(sellAmount)
      }
      this.isEthToken(sellCurrency, value)
      this.getFee()
    }
  }

  handleSellCurrencySelect = async ({ value }) => {
    const { buyCurrency, sellCurrency, sellAmount, buyAmount } = this.state
    if (buyCurrency === value) {
      this.switching()
    } else {
      this.checkPair(value)
      //@ts-ignore
      await this.checkBalance(value)
      await this.updateExchangeRate(value, buyCurrency)

      this.setState(() => ({
        sellCurrency: value,
      }))

      if (sellAmount > 0 || buyAmount > 0) {
        this.handleBuyAmountChange(buyAmount)
        this.handleSellAmountChange(sellAmount)
      }
      this.isEthToken(value, buyCurrency)
      this.getFee()
    }
  }

  handleExchangeRateChange = (value) => {
    let { buyAmount, sellAmount } = this.state

    if (!isNumberStringFormatCorrect(value)) {
      return undefined
    }

    this.handleAnyChange({
      type: 'rate',
      value,
    })

    return value
  }

  handleBuyAmountChange = (value) => {
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
    const { manualRate, exchangeRate, buyAmount, sellAmount, buyCurrency, sellCurrency } = this.state

    if (type === 'sell' || type === 'buy') {
      if (!this.isSending) {
        this.setState({ isSending: true })
      }
    }

    /*
        XR = S / B
        B = S / XR
        S = XR * B
    */

    switch (type) {
      case 'sell': {
        /*
          S++ -> XR++ -> B (Manual Rate)
          S++ -> XR -> B++ (Auto Rate)
        */

        const newSellAmount = new BigNumber(value || 0)

        if (manualRate) {
          const newExchangeRate = new BigNumber(value).dividedBy(buyAmount)

          this.setState({
            exchangeRate: newExchangeRate.isGreaterThan(0) ? newExchangeRate.toString() : '',
            sellAmount: newSellAmount.toString(),
          })
        } else {
          const newBuyAmount = newSellAmount.multipliedBy(exchangeRate || 0)
            .dp(constants.tokenDecimals[buyCurrency.toLowerCase()], BigNumber.ROUND_DOWN)

          this.setState({
            sellAmount: newSellAmount.toString(),
            buyAmount: newBuyAmount.toString(),
          })
        }
        break
      }

      case 'buy': {
        /*
          B++ -> XR-- -> S (Manual Rate)
          B++ -> XR -> S++ (Auto Rate)
        */

        const newBuyAmount = new BigNumber(value || 0)

        if (manualRate) {
          const newExchangeRate = new BigNumber(sellAmount).dividedBy(value)

          this.setState({
            exchangeRate: newExchangeRate.isGreaterThan(0) ? newExchangeRate.toString() : '',
            buyAmount: newBuyAmount.toString(),
          })
        } else {
          const newSellAmount = newBuyAmount.dividedBy(exchangeRate || 0)
            .dp(constants.tokenDecimals[sellCurrency.toLowerCase()], BigNumber.ROUND_DOWN)

          this.setState({
            sellAmount: newSellAmount.toString(),
            buyAmount: newBuyAmount.toString(),
          })
        }

        break
      }

      case 'rate': {
        if (new BigNumber(sellAmount).isGreaterThan(mathConstants.high_precision)) {
          // If user has set sell value change buy value
          /*
            XR++ -> S -> B--
          */

          const newBuyAmount = new BigNumber(sellAmount).dividedBy(value || 0)

          this.setState({
            buyAmount: newBuyAmount.toString(),
          })
        } else {
          // Otherwise change sell value if buy value is not null
          /*
            XR++ -> S++ -> B
          */

          const newSellAmount = new BigNumber(value || 0).multipliedBy(buyAmount)

          this.setState({
            sellAmount: newSellAmount.toString(),
          })
        }

        break
      }
      default:
        console.error('Unknown type')
        break
    }
  }

  handleNext = () => {
    const { onNext } = this.props

    // actions.analytics.dataEvent('orderbook-addoffer-click-next-button')
    onNext(this.state)
  }

  changeBalance = (value) => {
    this.setState(() => ({
      sellAmount: new BigNumber(value).toString(),
    }))

    this.handleSellAmountChange(value)
  }

  handleManualRate = (value) => {
    if (!value) {
      const { sellCurrency } = this.state
      this.handleSellCurrencySelect({ value: sellCurrency })
    }
    this.setState(() => ({ manualRate: value }))
  }

  switching = async () => {
    const { sellCurrency, buyCurrency, sellAmount, buyAmount } = this.state

    this.setState({
      sellAmount: '',
      buyAmount: '',
      sellCurrency: buyCurrency,
      buyCurrency: sellCurrency,
    }, async () => {
      //@ts-ignore
      await this.checkBalance(buyCurrency)
      await this.updateExchangeRate(buyCurrency, sellCurrency)

      actions.pairs.selectPair(buyCurrency)

      this.isEthToken(this.state.sellCurrency, this.state.buyCurrency)
      //@ts-ignore
      this.getFee(this.state.sellCurrency, this.state.buyCurrency)
    })
  }

  checkPair = (value) => {
    const selected = actions.pairs.selectPair(value)
    const check = selected.map(item => item.value).includes(this.state.buyCurrency)

    if (!check) {
      this.setState(() => ({
        buyCurrency: selected[0].value,
      }))
    }
  }

  render() {
    const { currencies, tokenItems, addSelectedItems } = this.props
    const { 
      exchangeRate, buyAmount, 
      sellAmount, buyCurrency, 
      sellCurrency, minimalestAmountForSell, 
      minimalestAmountForBuy, balance, 
      ethBalance, manualRate, 
      isPartial, isTokenSell, 
      isTokenBuy, sellInputValueIsOk 
    } = this.state

    const linked = Link.all(this, 'exchangeRate', 'buyAmount', 'sellAmount')

    const minimalAmountSell = !isTokenSell
      ? coinsWithDynamicFee.includes(sellCurrency) ? minimalestAmountForSell : minAmountOffer[buyCurrency]
      : 0.001

    const minimalAmountBuy = !isTokenBuy
      ? coinsWithDynamicFee.includes(buyCurrency) ? minimalestAmountForBuy : minAmountOffer[buyCurrency]
      : 0.001

    const isDisabled = !exchangeRate
      || !buyAmount && !sellAmount
      || new BigNumber(sellAmount).isGreaterThan(balance)
      || new BigNumber(sellAmount).isLessThan(minimalAmountSell)
      || new BigNumber(buyAmount).isLessThan(minimalAmountBuy)

    if (linked.sellAmount.value !== '' && linked.sellAmount.value > 0) {
      linked.sellAmount.check((value) => (new BigNumber(value).isGreaterThan(minimalAmountSell)),
        <span>
          <FormattedMessage id="transaction444" defaultMessage="Sell amount must be greater than " />
          {' '}
          {minimalAmountSell}
        </span>
      )
    }
    if (linked.buyAmount.value !== '' && linked.sellAmount.value > 0) {
      linked.buyAmount.check((value) => (new BigNumber(value).isGreaterThan(minimalAmountBuy)),
        <span>
          <FormattedMessage id="transaction450" defaultMessage="Buy amount must be greater than " />
          {' '}
          {minimalAmountBuy}
        </span>
      )
    }

    return (
      <div styleName={`wrapper addOffer ${isDark ? '--dark' : ''} `}>
        <div styleName="offerTitle">
          <FormattedMessage id="offerMessageToUser" defaultMessage="You must be online all the time, otherwise your order will not be visible to other users" />
        </div>
        
        <SelectGroup
          isDark={isDark}
          switchBalanceFunc={this.switching}
          label={<FormattedMessage id="addoffer381" defaultMessage="Sell" />}
          tooltip={<FormattedMessage id="partial462" defaultMessage="The amount you have on swap.online or an external wallet that you want to exchange" />}
          inputValueLink={linked.sellAmount.pipe(this.handleSellAmountChange)}
          dontDisplayError
          selectedValue={sellCurrency}
          onSelect={this.handleSellCurrencySelect}
          id="sellAmount"
          balance={balance}
          currencies={currencies}
          placeholder="0.00000000"
        />
        {/*
        //@ts-ignore*/}
        <Select
          isDark={isDark}
          changeBalance={this.changeBalance}
          balance={balance}
          currency={sellCurrency}
          switching={this.switching}
        />

        <SelectGroup
          isDark={isDark}
          switchBalanceFunc={this.switching}
          label={<FormattedMessage id="addoffer396" defaultMessage="Buy" />}
          tooltip={<FormattedMessage id="partial478" defaultMessage="The amount you will receive after the exchange" />}
          inputValueLink={linked.buyAmount.pipe(this.handleBuyAmountChange)}
          dontDisplayError
          selectedValue={buyCurrency}
          onSelect={this.handleBuyCurrencySelect}
          id="buyAmount"
          currencies={addSelectedItems}
          placeholder="0.00000000"
        />

        <div styleName="exchangeRate">
          {/*
          //@ts-ignore */}
          <ExchangeRateGroup
            isDark={isDark}
            label={<FormattedMessage id="addoffer406" defaultMessage="Exchange rate" />}
            inputValueLink={linked.exchangeRate.pipe(this.handleExchangeRateChange)}
            dontDisplayError
            currency={false}
            disabled={!manualRate}
            id="exchangeRate"
            placeholder="Enter exchange rate amount"
            buyCurrency={buyCurrency}
            sellCurrency={sellCurrency}
          />
        </div>

        <div styleName="controlsToggles">
          <div styleName="togles">
            {/*
            //@ts-ignore */}
            <Toggle checked={manualRate} onChange={this.handleManualRate} />
            <div styleName="togleText">
              <FormattedMessage id="AddOffer418" defaultMessage="Custom exchange rate" />
              {' '}
              <Tooltip id="add264">
                <FormattedMessage id="add408" defaultMessage="To change the exchange rate " />
              </Tooltip>
            </div>
          </div>
          <div styleName="togles">
            {/*
            //@ts-ignore */}
            <Toggle checked={isPartial} onChange={() => this.setState((state) => ({ isPartial: !state.isPartial }))} />
            <div styleName="togleText">
              <FormattedMessage id="AddOffer423" defaultMessage="Enable partial fills" />
              {' '}
              <Tooltip id="add547">
                <div style={{ textAlign: 'center' }} >
                  <FormattedMessage
                    id="addOfferPartialTooltip"
                    defaultMessage={`You will receive exchange requests or the {p} amount less than the total amount you want {p} sell. For example you want to sell 1 BTC,
                      other users can send you exchange requests {p}for 0.1, 0.5 BTC`}
                    values={{ p: <br /> }}
                  />
                </div>
              </Tooltip>
            </div>
          </div>
        </div>

        {
          Object.values(linked).map((item, index) => Boolean(item.error)
            ? <div key={index} styleName="Error">{item.error}</div>
            : ''
          )
        }
        <Button styleName="button" fullWidth blue disabled={isDisabled} onClick={this.handleNext}>
          <FormattedMessage id="AddOffer396" defaultMessage="Next" />
        </Button>
      </div>
    )
  }
}
