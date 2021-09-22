import React, { Component } from 'react'

import { connect } from 'redaction'
import actions from 'redux/actions'
import erc20Like from 'common/erc20Like'
import helpers, { constants } from 'helpers'
import swapsHelper from 'helpers/swaps'

import Link from 'local_modules/sw-valuelink'
import config from 'app-config'

import { BigNumber } from 'bignumber.js'

import styles from './AddOffer.scss'
import cssModules from 'react-css-modules'

import Select from './Select/Select'
import ExchangeRateGroup from './ExchangeRateGroup/ExchangeRateGroup'
import SelectGroup from 'components/SelectGroup'

import Button from 'components/controls/Button/Button'
import Toggle from 'components/controls/Toggle/Toggle'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import { FormattedMessage } from 'react-intl'
import COINS_WITH_DYNAMIC_FEE from 'common/helpers/constants/COINS_WITH_DYNAMIC_FEE'
import TurboIcon from 'shared/components/ui/TurboIcon/TurboIcon'
import MIN_AMOUNT_OFFER from 'common/helpers/constants/MIN_AMOUNT'
import turboSwap from 'common/helpers/turboSwap'
import getCoinInfo from 'common/coins/getCoinInfo'


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

@connect(
  ({
    currencies,
  }) => ({
    currencies: swapsHelper.isExchangeAllowed(currencies.partialItems),
    addSelectedItems: swapsHelper.isExchangeAllowed(currencies.addPartialItems),
    currenciesOrig: currencies,
  })
)
@cssModules(styles, { allowMultiple: true })
export default class AddOffer extends Component<any, any> {

  isSending: any

  constructor(props) {
    super(props)

    const { initialData } = props

    if (config?.isWidget) {
      if (window?.widgetEvmLikeTokens?.length) {
        window.widgetEvmLikeTokens.forEach((token) => {
          MIN_AMOUNT_OFFER[token.name.toLowerCase()] = 1
        })
      } else {
        MIN_AMOUNT_OFFER[config.erc20token] = 1
      }
    }

    const { exchangeRate, buyAmount, sellAmount, buyCurrency, sellCurrency } = initialData || {}

    this.state = {
      balance: null,
      isTokenSell: false,
      isTokenBuy: false,
      isPartial: true,
      isTurbo: false,
      isSending: false,
      manualRate: true,
      buyAmount: buyAmount || '',
      sellAmount: sellAmount || '',
      exchangeRate: exchangeRate || 1,
      buyCurrency: buyCurrency || 'btc',
      sellCurrency: sellCurrency || 'eth',
      buyBlockchain: ``,
      sellBlockchain: ``,
      minimalestAmountForBuy: MIN_AMOUNT_OFFER[buyCurrency] || MIN_AMOUNT_OFFER.btc,
      minimalestAmountForSell: MIN_AMOUNT_OFFER[sellCurrency] || MIN_AMOUNT_OFFER.eth,
      tokenBaseCurrencyBalance: 0,
      // @to-do buy and sell for support token-token orders
      balanceForBuyTokenFee: 0,
      balanceForSellTokenFee: 0,
    }
  }

  componentDidMount() {
    const { sellCurrency, buyCurrency } = this.state

    actions.pairs.selectPairPartial(sellCurrency)
    this.checkBalance(sellCurrency)
    this.updateExchangeRate(sellCurrency, buyCurrency)
    this.isTokenOffer(sellCurrency, buyCurrency)
    this.getFee()
    this.checkBalanceForTokenFee()

    const {
      coin: sellName,
      blockchain: sellBlockchain,
    } = getCoinInfo(sellCurrency)
    const {
      coin: buyName,
      blockchain: buyBlockchain,
    } = getCoinInfo(buyCurrency)

    if (sellBlockchain) {
      this.setState(() => ({ sellBlockchain }))
      this.updateTokenBaseWalletBalance(sellBlockchain)
    }
    if (buyBlockchain) {
      this.setState(() => ({ buyBlockchain }))
      this.updateTokenBaseWalletBalance(buyBlockchain)
    }
  }

  updateTokenBaseWalletBalance = async (baseCurrency) => {
    const tokenBaseCurrencyBalance = await actions[baseCurrency.toLowerCase()].getBalance()

    this.setState(() => ({
      tokenBaseCurrencyBalance,
    }))
  }

  getFee = () => {
    const { sellCurrency, buyCurrency } = this.state

    this.correctMinAmountSell(sellCurrency)
    this.correctMinAmountBuy(buyCurrency)
  }

  checkBalanceForTokenFee = async () => {
    const {
      sellBlockchain,
      buyBlockchain,
    } = this.state
    const balanceForBuyTokenFee = (buyBlockchain !== ``)
      ? await actions[buyBlockchain.toLowerCase()].getBalance()
      : 0
    const balanceForSellTokenFee = (sellBlockchain !== ``)
      ? await actions[sellBlockchain.toLowerCase()].getBalance()
      : 0

    this.setState(() => ({
      balanceForBuyTokenFee,
      balanceForSellTokenFee,
    }))
  }

  checkBalance = async (sellCurrency) => {
    const sellWallet = actions.core.getWallet({ currency: sellCurrency })
    let balance = new BigNumber(
      await actions.core.fetchWalletBalance(sellWallet)
    )
    let { unconfirmedBalance } = sellWallet

    unconfirmedBalance = new BigNumber(unconfirmedBalance)

    const currentBalance = unconfirmedBalance.isNaN() && unconfirmedBalance.isLessThan(0)
      ? balance.plus(unconfirmedBalance)
      : balance

    const balanceWithoutFee = !erc20Like.isToken({ name: sellCurrency })
      ? currentBalance
      : currentBalance.minus(this.state.minimalestAmountForSell)

    const finalBalance = balanceWithoutFee.isGreaterThan(0) ? balanceWithoutFee : new BigNumber(0)

    this.setState({
      balance: finalBalance.toString(),
    })
  }

  isTokenOffer = (sellCurrency, buyCurrency) => {
    const isTokenSell = erc20Like.isToken({ name: sellCurrency })
    const isTokenBuy = erc20Like.isToken({ name: buyCurrency })

    this.setState(() => ({
      isTokenBuy,
      isTokenSell,
    }))
  }

  correctMinAmountSell = async (sellCurrency) => {
    const isToken = erc20Like.isToken({ name: sellCurrency })

    if (COINS_WITH_DYNAMIC_FEE.includes(sellCurrency) && !isToken) {
      const minimalestAmountForSell = await helpers[sellCurrency].estimateFeeValue({ method: 'swap', speed: 'fast' })

      this.setState({
        minimalestAmountForSell,
      })
    }
  }

  correctMinAmountBuy = async (buyCurrency) => {
    const isToken = erc20Like.isToken({ name: buyCurrency })

    if (COINS_WITH_DYNAMIC_FEE.includes(buyCurrency) && !isToken) {
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
      this.setState({ exchangeRate }, () => resolve(true))
    })
  }

  handleBuyCurrencySelect = async (selectedItem) => {
    const { value, blockchain } = selectedItem
    const { sellCurrency, buyAmount, sellAmount } = this.state

    this.setState({
      isTurbo: false,
    })

    if (sellCurrency === value) {
      this.switching()
    } else {
      this.checkPair(sellCurrency)
      await this.checkBalance(sellCurrency)
      await this.updateExchangeRate(sellCurrency, value)
      this.isTokenOffer(sellCurrency, value)

      this.setState(() => ({
        buyCurrency: value,
        buyBlockchain: blockchain,
      }), () => {
        const { isTokenBuy } = this.state

        if (isTokenBuy) {
          this.checkBalanceForTokenFee()
          this.updateTokenBaseWalletBalance(blockchain)
        }
      })

      if (sellAmount > 0 || buyAmount > 0) {
        this.handleBuyAmountChange(buyAmount)
        this.handleSellAmountChange(sellAmount)
      }

      this.getFee()
    }
  }

  handleSellCurrencySelect = async (selectedItem) => {
    const { value, blockchain } = selectedItem
    const { buyCurrency, sellCurrency, sellAmount, buyAmount } = this.state

    this.setState({
      isTurbo: false,
    })

    if (buyCurrency === value) {
      this.switching()
    } else {
      this.checkPair(value)
      await this.checkBalance(value)
      await this.updateExchangeRate(value, buyCurrency)
      this.isTokenOffer(value, buyCurrency)

      this.setState(() => ({
        sellCurrency: value,
        sellBlockchain: blockchain,
      }), () => {
        const { isTokenSell } = this.state

        if (isTokenSell) {
          this.checkBalanceForTokenFee()
          this.updateTokenBaseWalletBalance(blockchain)
        }
      })

      if (sellAmount > 0 || buyAmount > 0) {
        this.handleBuyAmountChange(buyAmount)
        this.handleSellAmountChange(sellAmount)
      }

      this.getFee()
    }
  }

  handleExchangeRateChange = (value) => {
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
    const {
      sellCurrency,
      buyCurrency,
      balanceForSellTokenFee,
      balanceForBuyTokenFee,
      buyBlockchain,
      sellBlockchain,
    } = this.state

    this.setState(() => ({
      sellCurrency: buyCurrency,
      sellBlockchain: buyBlockchain,
      sellAmount: '',
      balanceForSellTokenFee: balanceForBuyTokenFee,
      // ----
      buyCurrency: sellCurrency,
      buyBlockchain: sellBlockchain,
      buyAmount: '',
      balanceForBuyTokenFee: balanceForSellTokenFee,
    }), async () => {
      await this.checkBalance(buyCurrency)
      await this.updateExchangeRate(buyCurrency, sellCurrency)

      actions.pairs.selectPairPartial(buyCurrency)

      this.isTokenOffer(this.state.sellCurrency, this.state.buyCurrency)
      this.getFee()
    })
  }

  checkPair = (value) => {
    const selected = actions.pairs.selectPairPartial(value)
    const check = selected.map(item => item.value).includes(this.state.buyCurrency)

    if (!check) {
      this.setState(() => ({
        buyCurrency: selected[0].value,
      }))
    }
  }

  render() {
    const { currencies, addSelectedItems } = this.props

    const { 
      exchangeRate,
      buyAmount,
      sellAmount,
      buyCurrency,
      sellCurrency,
      minimalestAmountForSell,
      minimalestAmountForBuy,
      balance,
      tokenBaseCurrencyBalance,
      manualRate,
      isPartial,
      isTurbo,
      isTokenSell,
      isTokenBuy,
    } = this.state

    // @to-do - fetch eth miner fee for swap
    const minAmountForSwap = 0.004
    const needEthBalance = (new BigNumber(tokenBaseCurrencyBalance).isLessThan(minAmountForSwap) && (isTokenBuy || isTokenSell))
    const linked = Link.all(this, 'exchangeRate', 'buyAmount', 'sellAmount')

    const minimalAmountSell = !isTokenSell
      ? COINS_WITH_DYNAMIC_FEE.includes(sellCurrency) ? minimalestAmountForSell : MIN_AMOUNT_OFFER[buyCurrency]
      : 0.001

    const minimalAmountBuy = !isTokenBuy
      ? COINS_WITH_DYNAMIC_FEE.includes(buyCurrency) ? minimalestAmountForBuy : MIN_AMOUNT_OFFER[buyCurrency]
      : 0.001

    // temporary: hide turboswaps on mainnet
    const isShowSwapModeSwitch = !process.env.MAINNET

    const isTurboAllowed = turboSwap.isAssetSupported(buyCurrency) && turboSwap.isAssetSupported(sellCurrency)

    const isDisabled = !exchangeRate
      || !buyAmount && !sellAmount
      || new BigNumber(sellAmount).isGreaterThan(balance)
      || new BigNumber(sellAmount).isLessThan(minimalAmountSell)
      || new BigNumber(buyAmount).isLessThan(minimalAmountBuy)
      || needEthBalance

    if (linked.sellAmount.value !== '' && linked.sellAmount.value > 0) {
      linked.sellAmount.check((value) => (new BigNumber(value).isGreaterThan(minimalAmountSell)),
        <span>
          <FormattedMessage id="transaction444" defaultMessage="Sell amount must be greater than " />
          {' '}
          {minimalAmountSell}
        </span>
      )
    }
    if (linked.buyAmount.value !== '' && linked.buyAmount.value > 0) {
      linked.buyAmount.check((value) => (new BigNumber(value).isGreaterThan(minimalAmountBuy)),
        <span>
          <FormattedMessage id="transaction450" defaultMessage="Buy amount must be greater than " />
          {' '}
          {minimalAmountBuy}
        </span>
      )
    }

    return (
      <div styleName={`wrapper addOffer`}>
        <div styleName="offerTitle">
          <FormattedMessage id="offerMessageToUser" defaultMessage="You must be online all the time, otherwise your order will not be visible to other users" />
        </div>

        <SelectGroup
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
        <Select
          changeBalance={this.changeBalance}
          balance={balance}
          switching={this.switching}
        />

        <SelectGroup
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
          <ExchangeRateGroup
            label={<FormattedMessage id="addoffer406" defaultMessage="Exchange rate" />}
            inputValueLink={linked.exchangeRate.pipe(this.handleExchangeRateChange)}
            disabled={!manualRate}
            id="exchangeRate"
            placeholder="Enter exchange rate amount"
            buyCurrency={buyCurrency}
            sellCurrency={sellCurrency}
          />
        </div>

        <div styleName="controlsToggles">
          <div styleName="toggle">
            <Toggle checked={manualRate} onChange={this.handleManualRate} />
            <div styleName="toggleText">
              <FormattedMessage id="AddOffer418" defaultMessage="Custom exchange rate" />
              {' '}
              <Tooltip id="add264">
                <FormattedMessage id="add408" defaultMessage="To change the exchange rate " />
              </Tooltip>
            </div>
          </div>

          <div styleName="toggle">
            <Toggle checked={isPartial} onChange={() => this.setState((state) => ({ isPartial: !state.isPartial }))} />
            <div styleName="toggleText">
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

          {isShowSwapModeSwitch &&
            <div styleName="toggle">
              <div styleName="toggleText">
                <FormattedMessage id="AtomicSwap_Title" defaultMessage="Atomic swap" />
              </div>
              <Toggle checked={isTurbo} isDisabled={!isTurboAllowed} onChange={() => this.setState((state) => ({ isTurbo: !state.isTurbo }))} />
              <div styleName="toggleText">
                <TurboIcon />
                <span>
                  <FormattedMessage id="TurboSwap_Title" defaultMessage="Turbo swap" />
                  &nbsp;
                  <a href="https://github.com/swaponline/MultiCurrencyWallet/blob/master/docs/TURBO_SWAPS.md" target="_blank">(?)</a>
                </span>
              </div>
            </div>
          }
        </div>
        {needEthBalance && (
          <div styleName="Error">
            {isTokenBuy && (
              <FormattedMessage
                id="CreateOffer_BuyToken_NeedEth"
                defaultMessage="Для покупки {buyCurrency} вам нужно иметь {ethAmount} ETH для оплаты коммисии"
                values={{
                  buyCurrency: buyCurrency.toUpperCase(),
                  ethAmount: minAmountForSwap,
                }}
              />
            )}
            {isTokenSell && (
              <FormattedMessage
                id="CreateOffer_SellToken_NeedEth"
                defaultMessage="Для продажи {sellCurrency} вам нужно иметь {ethAmount} ETH для оплаты коммисии"
                values={{
                  sellCurrency: sellCurrency.toUpperCase(),
                  ethAmount: minAmountForSwap,
                }}
              />
            )}
          </div>
        )}
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
