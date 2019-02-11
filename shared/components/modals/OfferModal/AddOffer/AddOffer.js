import React, { Component } from 'react'

import { connect } from 'redaction'
import actions from 'redux/actions'
import helpers, { constants } from 'helpers'

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
import minAmountOffer from 'helpers/constants/minAmountOffer'
import coinsWithDynamicFee from 'helpers/constants/coinsWithDynamicFee'


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
      minAmountOffer[config.erc20token] = 1
    }

    const { exchangeRate, buyAmount, sellAmount, buyCurrency, sellCurrency } = initialData || {}

    this.state = {
      balance: null,
      isToken: false,
      isPartial: true,
      isSending: false,
      manualRate: false,
      isBuyFieldInteger: false,
      isSellFieldInteger: false,
      buyAmount: buyAmount || '',
      sellAmount: sellAmount || '',
      exchangeRate: exchangeRate || 1,
      buyCurrency: buyCurrency || 'btc',
      sellCurrency: sellCurrency || 'eth',
    }
  }

  componentDidMount() {
    const { sellCurrency, buyCurrency, value } = this.state

    actions.pairs.selectPair(sellCurrency)

    this.checkBalance(sellCurrency)
    this.updateExchangeRate(sellCurrency, buyCurrency)
  }

  checkBalance = async (sellCurrency) => {
    const updateBalance = await actions[sellCurrency].getBalance(sellCurrency)

    this.setState({
      balance: updateBalance,
    })

    const { items, tokenItems } = this.props

    const currency = items.concat(tokenItems)
      .filter(item => item.currency === sellCurrency.toUpperCase())[0]

    let { balance, unconfirmedBalance } = currency

    balance = new BigNumber(balance)
    unconfirmedBalance = new BigNumber(unconfirmedBalance)

    if (helpers.ethToken.isEthToken({ name: sellCurrency })) {
      this.setState(() => ({
        isToken: true,
      }))
    } else {
      this.setState(() => ({
        isToken: false,
      }))
    }

    const currentBalance = unconfirmedBalance.isNaN() && unconfirmedBalance.isLessThan(0)
      ? balance.plus(unconfirmedBalance)
      : balance

    if (coinsWithDynamicFee.includes(sellCurrency)) {
      minAmountOffer[sellCurrency] = await helpers[sellCurrency].estimateFeeValue({ method: 'swap', speed: 'fast' })
      const balanceWithFeeValue = currentBalance.minus(minAmountOffer[sellCurrency])
      const finalBalance = balanceWithFeeValue.isGreaterThan(0) ? balanceWithFeeValue : 0

      this.setState({
        balance: finalBalance.toString(),
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

    sellAmount = new BigNumber(buyAmount || 0).multipliedBy(exchangeRate)

    const isBuyFieldInteger = config.erc20[buyCurrency] && config.erc20[buyCurrency].decimals === 0

    if (isBuyFieldInteger) {
      buyAmount = new BigNumber(buyAmount || 0).dp(0, BigNumber.ROUND_HALF_EVEN)
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

    buyAmount = new BigNumber(sellAmount || 0).multipliedBy(exchangeRate)

    const isSellFieldInteger = config.erc20[sellCurrency] && config.erc20[sellCurrency].decimals === 0

    if (isSellFieldInteger) {
      sellAmount = new BigNumber(sellAmount || 0).dp(0, BigNumber.ROUND_HALF_EVEN)
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
      case 'sell':  {
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
            .dp(constants.tokenDecimals[buyCurrency.toUpperCase()], BigNumber.ROUND_DOWN)

          this.setState({
            sellAmount: newSellAmount.toString(),
            buyAmount: newBuyAmount.toString(),
          })
        }
        break
      }

      case 'buy':  {
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
            .dp(constants.tokenDecimals[sellCurrency.toUpperCase()], BigNumber.ROUND_DOWN)

          this.setState({
            sellAmount: newSellAmount.toString(),
            buyAmount: newBuyAmount.toString(),
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

          const newBuyAmount  = new BigNumber(sellAmount).dividedBy(value || 0)

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
    const { exchangeRate, buyAmount, sellAmount, balance, sellCurrency, isToken } = this.state
    const { onNext, tokenItems } = this.props

    const isDisabled = !exchangeRate
      || !buyAmount
      || !sellAmount
      || new BigNumber(sellAmount).isGreaterThan(balance)
      || !isToken && new BigNumber(sellAmount).isLessThan(minAmountOffer[sellCurrency])


    if (!isDisabled) {
      actions.analytics.dataEvent('orderbook-addoffer-click-next-button')
      onNext(this.state)
    }
  }

  changeBalance = (value) => {
    this.setState(() => ({
      sellAmount: value,
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

  switching = async (value) => {
    const { sellCurrency, buyCurrency, sellAmount, buyAmount } = this.state

    await this.checkBalance(buyCurrency)
    await this.updateExchangeRate(buyCurrency, sellCurrency)

    actions.pairs.selectPair(buyCurrency)

    this.setState(() => ({
      sellCurrency: buyCurrency,
      buyCurrency: sellCurrency,
    }))

    if (sellAmount > 0 || buyAmount > 0) {
      this.handleBuyAmountChange(sellAmount)
      this.handleSellAmountChange(buyAmount)
    }
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
    const { exchangeRate, buyAmount, sellAmount, buyCurrency, sellCurrency,
      balance, isBuyFieldInteger, isSellFieldInteger, manualRate, isPartial, isToken } = this.state
    const linked = Link.all(this, 'exchangeRate', 'buyAmount', 'sellAmount')
    const minimalAmount = !isToken
      ? new BigNumber(minAmountOffer[sellCurrency]).dp(6, BigNumber.ROUND_DOWN).toString()
      : 0

    const isDisabled = !exchangeRate
      || !buyAmount && !sellAmount
      || new BigNumber(balance).isLessThanOrEqualTo(sellAmount)
      || !isToken && new BigNumber(minimalAmount).isGreaterThanOrEqualTo(sellAmount)

    linked.sellAmount.check((value) => new BigNumber(minimalAmount).isLessThanOrEqualTo(value),
      <span style={{ position: 'relative', marginRight: '44px' }}>
        <FormattedMessage id="transaction368" defaultMessage="Amount must be greater than " />
        {minimalAmount}
      </span>
    )
    linked.sellAmount.check((value) => new BigNumber(balance).isGreaterThan(value),
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
