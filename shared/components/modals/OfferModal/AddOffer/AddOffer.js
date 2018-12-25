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
import Input from 'components/forms/Input/Input'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import { FormattedMessage } from 'react-intl'
import { isNumberValid, isNumberStringFormatCorrect, mathConstants } from 'helpers/math.js'


const minAmount = {
  eth: 0.005,
  btc: 0.001,
  ltc: 0.1,
  eos: 1,
  noxon: 1,
  swap: 1,
  jot: 1,
}

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
      isPartial: true,
    }
  }

  componentDidMount() {
    const { sellCurrency, buyCurrency, value } = this.state

    actions.pairs.selectPair(sellCurrency)

    this.checkBalance(sellCurrency)
    this.updateExchangeRate(sellCurrency, buyCurrency)
  }

  checkBalance = async (sellCurrency) => {
    await actions[sellCurrency].getBalance(sellCurrency)

    const { items, tokenItems } = this.props

    const currency = items.concat(tokenItems)
      .filter(item => item.currency === sellCurrency.toUpperCase())[0]

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
      sellCurrency: value,
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
    const { exchangeRate, buyAmount, sellAmount, buyCurrency, sellCurrency,
      balance, isBuyFieldInteger, isSellFieldInteger, ethBalance, manualRate, isPartial } = this.state
    const linked = Link.all(this, 'exchangeRate', 'buyAmount', 'sellAmount')
    const isDisabled = !exchangeRate || !buyAmount && !sellAmount
      || sellAmount > balance || sellAmount < minAmount[sellCurrency]
      || this.isEthOrERC20()

    linked.sellAmount.check((value) => Number(value) > minAmount[sellCurrency],
      <span style={{ position: 'relative', marginRight: '44px' }}>
        <FormattedMessage id="transaction368" defaultMessage="Amount must be greater than " />
        {minAmount[sellCurrency]}
      </span>
    )
    linked.sellAmount.check((value) => Number(value) <= balance,
      <span style={{ position: 'relative', marginRight: '44px' }}>
        <FormattedMessage id="transaction376" defaultMessage="Amount must be less than your balance " />
      </span>
    )

    return (
      <div styleName="wrapper addOffer">
        { this.isEthOrERC20() &&
          <span styleName="error">
            <FormattedMessage
              id="transaction436"
              defaultMessage="For a swap, you need {minAmount} ETH on your balance"
              values={{ minAmount:`${minAmount.eth}` }}
            />

          </span>
        }
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
          <FormattedMessage id="AddOffer423" defaultMessage="Enabled to partial closure" />
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
