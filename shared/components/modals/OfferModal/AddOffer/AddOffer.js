import React, { Component } from 'react'

import { connect } from 'redaction'
import actions from 'redux/actions'
import helpers from 'helpers'

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
import Input from 'components/forms/Input/Input'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import { FormattedMessage } from 'react-intl'
import { isNumberValid, isNumberStringFormatCorrect, mathConstants } from 'helpers/math.js'


const minAmount = {
  eth: 0.005,
  btc: 0.001,
  ltc: 0.1,
  eos: 1,
  jot: 1,
  usdt: 0,
  erc: 1,
}

const coinsWithDynamicFee = [
  'eth',
  'ltc',
  'btc',
]

@connect(
  ({
    currencies,
    addSelectedItems,
    user: { ethData, btcData, /* bchData, */ tokensData, eosData, telosData, nimData, usdtData, ltcData },
  }) => ({
    currencies: currencies.items,
    addSelectedItems: currencies.addSelectedItems,
    items: [ ethData, btcData, eosData, telosData, /* bchData, */ ltcData, usdtData /* nimData */ ],
    tokenItems: [ ...Object.keys(tokensData).map(k => (tokensData[k])) ],
  })
)
@cssModules(styles, { allowMultiple: true })
export default class AddOffer extends Component {
  constructor({ initialData }) {
    super()

    if (config && config.isWidget) {
      minAmount[config.erc20token] = 1
    }

    const { exchangeRate, buyAmount, sellAmount, buyCurrency, sellCurrency } = initialData || {}

    this.state = {
      balance: null,
      isToken: false,
      isPartial: true,
      isSending: false,
      ethBalance: null,
      manualRate: false,
      isBuyFieldInteger: false,
      isSellFieldInteger: false,
      buyAmount: buyAmount || '',
      sellAmount: sellAmount || '',
      exchangeRate: exchangeRate || 1,
      buyCurrency: buyCurrency || 'btc',
      sellCurrency: sellCurrency || 'eth',
      minimalestAmountForBuy: minAmount[buyCurrency] || minAmount.btc,
      minimalestAmountForSell: minAmount[sellCurrency] || minAmount.eth,
    }
  }

  componentDidMount() {
    const { sellCurrency, buyCurrency, value } = this.state

    actions.pairs.selectPair(sellCurrency)
    this.checkBalance(sellCurrency, buyCurrency)
    this.correctMinAmountSell(sellCurrency)
    this.correctMinAmountBuy(buyCurrency)
    this.updateExchangeRate(sellCurrency, buyCurrency)
  }

  checkBalance = async (sellCurrency, buyCurrency) => {
    const updateBalance = await actions[sellCurrency].getBalance(sellCurrency)

    this.setState({
      balance: updateBalance,
    })

    const { items, tokenItems } = this.props

    const currency = items.concat(tokenItems)
      .filter(item => item.currency === sellCurrency.toUpperCase())[0]

    const { balance, unconfirmedBalance } = currency

    if (helpers.ethToken.isEthToken({ name: sellCurrency })) {
      this.setState(() => ({
        isToken: true,
      }))
    } else {
      this.setState(() => ({
        isToken: false,
      }))
    }

    const currentBalance = unconfirmedBalance !== undefined && unconfirmedBalance < 0
      ? new BigNumber(balance).plus(unconfirmedBalance)
      : balance

    const finalBalance = BigNumber(currentBalance).minus(this.state.minimalestAmountForSell) > 0 ? BigNumber(currentBalance).minus(this.state.minimalestAmountForSell) : 0
    this.setState({
      balance: finalBalance,
    })
  }

  correctMinAmountSell = async (sellCurrency) => {
    if (coinsWithDynamicFee.includes(sellCurrency)) {
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
      return
    }
  }

  async updateExchangeRate(sellCurrency, buyCurrency) {
    const exchangeRate = await actions.user.getExchangeRate(sellCurrency, buyCurrency)


    return new Promise((resolve, reject) => {
      this.setState({ exchangeRate }, () => resolve())
    })
  }

  handleBuyCurrencySelect = async ({ value }) => {
    let { buyCurrency, sellCurrency, buyAmount, sellAmount } = this.state

    this.checkPair(this.state.sellCurrency)

    await this.checkBalance(sellCurrency)

    await this.updateExchangeRate(sellCurrency, value)
    const { exchangeRate } = this.state
    sellAmount = new BigNumber(String(buyAmount) || 0).multipliedBy(exchangeRate)

    const isBuyFieldInteger = config.erc20[buyCurrency] && config.erc20[buyCurrency].decimals === 0

    if (isBuyFieldInteger) {
      buyAmount = new BigNumber(String(buyAmount) || 0).dp(0, BigNumber.ROUND_HALF_EVEN)
    }
    this.setState({
      buyCurrency: value,
      sellAmount: Number.isNaN(sellAmount) ? '' : sellAmount,
      buyAmount: Number.isNaN(buyAmount) ? '' : buyAmount,
      isSellFieldInteger: config.erc20[sellCurrency] && config.erc20[sellCurrency].decimals === 0,
      isBuyFieldInteger,
    })
  }

  handleSellCurrencySelect = async ({ value }) => {
    let { buyCurrency, sellCurrency, sellAmount, buyAmount } = this.state

    this.setState(() => ({
      sellCurrency: value,
    }))

    this.checkPair(value)

    await this.checkBalance(value)

    await this.updateExchangeRate(value, buyCurrency)
    const { exchangeRate } = this.state
    buyAmount = new BigNumber(String(sellAmount) || 0).multipliedBy(exchangeRate)

    const isSellFieldInteger = config.erc20[sellCurrency] && config.erc20[sellCurrency].decimals === 0

    if (isSellFieldInteger) {
      sellAmount = new BigNumber(String(sellAmount) || 0).dp(0, BigNumber.ROUND_HALF_EVEN)
    }

    this.setState({
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

  handleNext = () => {
    const {
      exchangeRate,
      buyAmount,
      sellAmount,
      balance,
      sellCurrency,
      ethBalance,
      isToken,
      buyCurrency,
      minimalestAmountForSell,
      minimalestAmountForBuy,
    } = this.state

    const { onNext, tokenItems } = this.props

    if (!coinsWithDynamicFee.includes(sellCurrency || buyCurrency)) {
      this.setState(() => ({
        minimalestAmountForBuy: minAmount[buyCurrency],
        minimalestAmountForSell: minAmount[sellCurrency],
      }))
    }
    const isDisabled = !exchangeRate || !buyAmount || !sellAmount || sellAmount > balance
      || !isToken && sellAmount < minimalestAmountForSell || buyAmount < minimalestAmountForBuy

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

  switching = async (value) => {
    const { sellCurrency, buyCurrency, sellAmount, buyAmount } = this.state

    await this.checkBalance(buyCurrency)
    await this.updateExchangeRate(buyCurrency, sellCurrency)

    if (Number(sellAmount) > 0 || Number(buyAmount) > 0) {
      this.handleBuyAmountChange(sellAmount)
      this.handleSellAmountChange(buyAmount)
    }
    actions.pairs.selectPair(buyCurrency)
    this.setState({
      sellCurrency: buyCurrency,
      buyCurrency: sellCurrency,
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
    const { exchangeRate, buyAmount, sellAmount, buyCurrency, sellCurrency, minimalestAmountForSell, minimalestAmountForBuy,
      balance, isBuyFieldInteger, isSellFieldInteger, ethBalance, manualRate, isPartial, isToken } = this.state
    const linked = Link.all(this, 'exchangeRate', 'buyAmount', 'sellAmount')

    const minAmountSell = coinsWithDynamicFee.includes(sellCurrency) ? minimalestAmountForSell : minAmount[sellCurrency]
    const minAmountBuy = coinsWithDynamicFee.includes(buyCurrency) ? minimalestAmountForBuy : minAmount[buyCurrency]

    const minimalAmountSell = !isToken ? Math.floor(minAmountSell * 1e6) / 1e6 : 0
    const minimalAmountBuy = !isToken ? Math.floor(minAmountBuy * 1e6) / 1e6 : 0

    const isDisabled = !exchangeRate || !buyAmount && !sellAmount
      || sellAmount > balance || !isToken && sellAmount < minimalAmountSell || buyAmount < minimalAmountBuy


    if (linked.sellAmount.value !== '') {
      linked.sellAmount.check((value) => (Number(value) > minimalAmountSell),
        <span style={{ position: 'relative', marginRight: '44px' }}>
          <FormattedMessage id="transaction444" defaultMessage="Sell amount must be greater than " />
          {minimalAmountSell}
        </span>
      )
    }
    if (linked.sellAmount.value !== '') {
      linked.buyAmount.check((value) => (Number(value) > minimalAmountBuy),
        <span style={{ position: 'relative', marginRight: '44px' }}>
          <FormattedMessage id="transaction450" defaultMessage="Buy amount must be greater than " />
          {minimalAmountBuy}
        </span>
      )
    }

    linked.sellAmount.check((value) => Number(value) <= balance,
      <span style={{ position: 'relative', marginRight: '44px' }}>
        <FormattedMessage id="transaction376" defaultMessage="Amount must be less than your balance " />
      </span>
    )

    return (
      <div styleName="wrapper addOffer">
        <SelectGroup
          styleName="sellGroup"
          label={<FormattedMessage id="addoffer381" defaultMessage="Sell" />}
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
          switching={this.switching}
        />
        <SelectGroup
          label={<FormattedMessage id="addoffer396" defaultMessage="Buy" />}
          inputValueLink={linked.buyAmount.pipe(this.handleBuyAmountChange)}
          selectedCurrencyValue={buyCurrency}
          onCurrencySelect={this.handleBuyCurrencySelect}
          id="buyAmount"
          currencies={addSelectedItems}
          isInteger={isBuyFieldInteger}
          placeholder="Enter buy amount"
        />
        <div styleName="exchangeRate">
          <ExchangeRateGroup
            label={<FormattedMessage id="addoffer406" defaultMessage="Exchange rate" />}
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
          <Toggle checked={manualRate} onChange={this.handleManualRate} />
          <FormattedMessage id="AddOffer418" defaultMessage="Custom exchange rate" />
          {' '}
          <Tooltip id="add264">
            <FormattedMessage id="add408" defaultMessage="To change the exchange rate " />
          </Tooltip>
        </div>
        <div>
          <Toggle checked={isPartial} onChange={() => this.setState((state) => ({ isPartial: !state.isPartial }))} />
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
        <Button styleName="button" fullWidth brand disabled={isDisabled} onClick={this.handleNext}>
          <FormattedMessage id="AddOffer396" defaultMessage="Next" />
        </Button>
      </div>
    )
  }
}
