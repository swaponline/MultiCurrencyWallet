import React, { Component, Fragment } from 'react'

import Link from 'sw-valuelink'

import CSSModules from 'react-css-modules'
import styles from './PartialClosure.scss'

import { connect } from 'redaction'
import actions from 'redux/actions'
import { BigNumber } from 'bignumber.js'
import { Redirect } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { getState } from 'redux/core'
import reducers from 'redux/core/reducers'
import { isMobile } from 'react-device-detect'

import SelectGroup from './SelectGroup/SelectGroup'
import Select from 'components/modals/OfferModal/AddOffer/Select/Select'
import Advantages from './PureComponents/Advantages'
import { Button, Toggle, Flip } from 'components/controls'
import Input from 'components/forms/Input/Input'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import Referral from 'components/Footer/Referral/Referral'
import PageHeadline from 'components/PageHeadline/PageHeadline'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import { FormattedMessage, injectIntl } from 'react-intl'
import { localisedUrl } from 'helpers/locale'

import { isCoinAddress } from 'swap.app/util/typeforce'
import config from 'app-config'
import SwapApp, { util } from 'swap.app'

import helpers, { constants, links } from 'helpers'


const filterIsPartial = (orders) => orders
  .filter(order => order.isPartial && !order.isProcessing && !order.isHidden)
  .filter(order => (order.sellAmount !== 0) && order.sellAmount.isGreaterThan(0)) // WTF sellAmount can be not BigNumber
  .filter(order => (order.buyAmount !== 0) && order.buyAmount.isGreaterThan(0)) // WTF buyAmount can be not BigNumber too - need fix this

const text = [
  <FormattedMessage id="partial223" defaultMessage="To change default wallet for buy currency. " />,
  <FormattedMessage id="partial224" defaultMessage="Leave empty for use Swap.Online wallet " />,
]

const subTitle = (sell, sellTicker, buy, buyTicker) => (
  <FormattedMessage
    id="partial437"
    defaultMessage="Atomic Swap {full_name1} ({ticker_name1}) to {full_name2} ({ticker_name2}) Instant Exchange"
    values={{ full_name1: sell, ticker_name1: sellTicker, full_name2: buy, ticker_name2: buyTicker }}
  />
)

const isWidgetBuild = config && config.isWidget
const bannedPeers = {} // Пиры, которые отклонили запрос на свап, они будут понижены в выдаче

@injectIntl
@connect(({
  currencies,
  addSelectedItems,
  rememberedOrders,
  addPartialItems,
  core: { orders, hiddenCoinsList },
  user: { ethData, btcData, /* bchData, */ tokensData, eosData, telosData, nimData, usdtData, ltcData },
}) => ({
  currencies: currencies.partialItems,
  allCurrencyies: currencies.items,
  addSelectedItems: currencies.addPartialItems,
  orders: filterIsPartial(orders),
  allOrders: orders,
  currenciesData: [ ethData, btcData, eosData, telosData, /* bchData, */ ltcData, usdtData /* nimData */ ],
  tokensData: [ ...Object.keys(tokensData).map(k => (tokensData[k])) ],
  decline: rememberedOrders.savedOrders,
  hiddenCoinsList,
  userEthAddress: ethData.address,
}))
@CSSModules(styles, { allowMultiple: true })
export default class PartialClosure extends Component {

  static defaultProps = {
    orders: [],
  }

  isPeerBanned(peerID) {
    if (bannedPeers[peerID]
      && (bannedPeers[peerID] > Math.floor(new Date().getTime() / 1000))
    ) {
      return true
    }
    return false
  }

  banPeer(peerID) {
    const bannedPeersTimeout = 180 // В секундах - три минуты
    bannedPeers[peerID] = Math.floor(new Date().getTime() / 1000) + bannedPeersTimeout
  }

  static getDerivedStateFromProps({ allOrders, orders, history, match: { params: { buy, sell, locale } } }, { haveCurrency, getCurrency }) {

    if (!Array.isArray(orders)) { return }

    const filteredOrders = orders.filter(order => !order.isMy
      && order.sellCurrency === getCurrency.toUpperCase()
      && order.buyCurrency === haveCurrency.toUpperCase())

    return {
      filteredOrders,
    }
  }

  constructor({ tokensData, allCurrencyies, currenciesData, match: { params: { buy, sell } }, intl: { locale }, history, decline, ...props }) {

    super()

    if (sell && buy) {
      if (!allCurrencyies.map(item => item.name).includes(sell.toUpperCase())
        || !allCurrencyies.map(item => item.name).includes(buy.toUpperCase())) {
        history.push(localisedUrl(locale, `/exchange/swap-to-btc`))
      }
    }

    const sellToken = sell || ((!isWidgetBuild) ? 'eth' : 'btc')
    const buyToken = buy || ((!isWidgetBuild) ? 'btc' : config.erc20token)

    this.returnNeedCurrency(sellToken, buyToken)

    if (!(buy && sell) && !props.location.hash.includes('#widget')) {
      history.push(localisedUrl(locale, `/exchange/${sellToken}-to-${buyToken}`))
    }

    this.wallets = {}
    currenciesData.forEach(item => {
      this.wallets[item.currency] = item.address
    })
    tokensData.forEach(item => {
      this.wallets[item.currency] = item.address
    })

    Array.of(sellToken, buyToken).forEach((item) => {
      const currency = item.toUpperCase()
      if (props.hiddenCoinsList.includes(currency)) {
        actions.core.markCoinAsVisible(currency)
      }
    })

    this.state = {
      isToken: false,
      dynamicFee: 0,
      haveCurrency: sellToken,
      getCurrency: buyToken,
      haveAmount: 0,
      haveUsd: 0,
      getUsd: 0,
      getAmount: '',
      maxAmount: 0,
      maxBuyAmount: new BigNumber(0),
      peer: '',
      goodRate: 0,
      filteredOrders: [],
      isNonOffers: false,
      isFetching: false,
      isDeclinedOffer: false,
      customWalletUse: true,
      customWallet: this.wallets[buyToken.toUpperCase()],
      extendedControls: false,
      estimatedFeeValues: {},
    }

    constants.coinsWithDynamicFee
      .forEach(item => this.state.estimatedFeeValues[item] = constants.minAmountOffer[item])

    let timer
    let usdRates

    if (config.isWidget) {
      this.state.getCurrency = config.erc20token
    }
  }

  componentDidMount() {
    const { haveCurrency, getCurrency, estimatedFeeValues } = this.state
    actions.core.updateCore()
    this.returnNeedCurrency(haveCurrency, getCurrency)

    this.checkPair()
    this.updateAllowedBalance()

    this.usdRates = {}
    this.getUsdBalance()

    this.timer = setInterval(() => {
      this.setOrders()
      this.showTheFee(haveCurrency)
    }, 2000)

    SwapApp.shared().services.room.on('new orders', () => this.checkPair())
    this.customWalletAllowed()
    this.setEstimatedFeeValues(estimatedFeeValues)
  }

  setEstimatedFeeValues = async (estimatedFeeValues) => {

    const fee = await helpers.estimateFeeValue.setEstimatedFeeValues({ estimatedFeeValues })

    return this.setState({
      estimatedFeeValues: fee,
    })
  }

  componentWillUnmount() {
    clearInterval(this.timer)
  }

  additionalPathing = (sell, buy) => {
    const { intl: { locale } } = this.props

    if (!this.props.location.hash.includes('#widget')) {
      this.props.history.push(localisedUrl(locale, `/exchange/${sell}-to-${buy}`))
    }
  }

  showTheFee = async () => {
    const { haveCurrency } = this.state
    const isToken = await helpers.ethToken.isEthToken({ name: haveCurrency.toLowerCase() })

    if (isToken) {
      this.setState(() => ({
        isToken,
      }))
    } else {
      const dynamicFee = await helpers[haveCurrency.toLowerCase()].estimateFeeValue({ method: 'swap' })
      this.setState(() => ({
        dynamicFee,
        isToken,
      }))
    }
  }

  getUsdBalance = async () => {
    const { haveCurrency, getCurrency } = this.state

    try {
      const exHaveRate = (this.usdRates[haveCurrency] !== undefined) ?
        this.usdRates[haveCurrency] : await actions.user.getExchangeRate(haveCurrency, 'usd')
      const exGetRate = (this.usdRates[getCurrency] !== undefined) ?
        this.usdRates[getCurrency] : await actions.user.getExchangeRate(getCurrency, 'usd')

      this.usdRates[haveCurrency] = exHaveRate
      this.usdRates[getCurrency] = exGetRate

      this.setState(() => ({
        exHaveRate,
        exGetRate,
      }))
    } catch (e) {
      console.log('Cryptonator offline')
    }
  }

  handleGoTrade = () => {
    const { intl: { locale }, decline } = this.props
    const { haveCurrency } = this.state

    if (decline.length === 0) {
      this.sendRequest()
    } else {
      const getDeclinedExistedSwapIndex = helpers.handleGoTrade.getDeclinedExistedSwapIndex({ currency: haveCurrency, decline })
      if (getDeclinedExistedSwapIndex !== false) {
        this.handleDeclineOrdersModalOpen(getDeclinedExistedSwapIndex)
      } else {
        this.sendRequest()
      }
    }
  }

  handleDeclineOrdersModalOpen = (indexOfDecline) => {
    const orders = SwapApp.shared().services.orders.items
    const declineSwap = actions.core.getSwapById(this.props.decline[indexOfDecline])

    if (declineSwap !== undefined) {
      actions.modals.open(constants.modals.DeclineOrdersModal, {
        declineSwap,
      })
    }
  }

  sendRequest = () => {
    const { getAmount, haveAmount, peer, orderId, customWallet } = this.state

    if (!String(getAmount) || !peer || !orderId || !String(haveAmount)) {
      return
    }

    const newValues = {
      sellAmount: getAmount,
    }

    const destination = {
      address: this.customWalletAllowed() ? customWallet : null,
    }

    this.setState(() => ({ isFetching: true }))

    actions.core.sendRequestForPartial(orderId, newValues, destination, (newOrder, isAccepted) => {
      if (isAccepted) {
        this.setState(() => ({
          redirect: true,
          isFetching: false,
          orderId: newOrder.id,
        }))
      } else {
        this.banPeer(peer)
        this.getLinkTodeclineSwap(peer)
        this.setDeclinedOffer()
      }
    })
  }

  getLinkTodeclineSwap = () => {
    const orders = SwapApp.shared().services.orders.items

    const unfinishedOrder = orders
      .filter(item => item.isProcessing === true)
      .filter(item => item.participant)
      .filter(item => item.participant.peer === this.state.peer)
      .filter(item => item.sellCurrency === this.state.getCurrency.toUpperCase())[0]

    if (!unfinishedOrder) return

    this.setState(() => ({
      wayToDeclinedOrder: `swaps/${unfinishedOrder.sellCurrency}-${unfinishedOrder.sellCurrency}/${unfinishedOrder.id}`,
    }))
  }

  returnNeedCurrency = (sellToken, buyToken) => {
    const partialItems = Object.assign(getState().currencies.partialItems) // eslint-disable-line

    const partialCurrency = getState().currencies.partialItems.map(item => item.name)
    const allCurrencyies = getState().currencies.items.map(item => item.name)
    let partialItemsArray = [...partialItems]
    let currenciesOfUrl = []
    currenciesOfUrl.push(sellToken, buyToken)

    currenciesOfUrl.forEach(item => {
      if (allCurrencyies.includes(item.toUpperCase())) {
        if (!partialCurrency.includes(item.toUpperCase())) {
          partialItemsArray.push(
            {
              name: item.toUpperCase(),
              title: item.toUpperCase(),
              icon: item.toLowerCase(),
              value: item.toLowerCase(),
            }
          )
          reducers.currencies.updatePartialItems(partialItemsArray)
        }
      } else {
        this.setState(() => ({
          haveCurrency: (config && config.isWidget) ? config.erc20token : 'swap',
        }))
      }
    })
  }


  setDeclinedOffer = () => {
    this.setState(() => ({ haveAmount: '', isFetching: false, isDeclinedOffer: true }))

    setTimeout(() => {
      this.setState(() => ({
        isDeclinedOffer: false,
      }))
    }, 7 * 1000)
  }

  setNoOfferState = () => {
    this.setState(() => ({ isNonOffers: true }))
  }

  setAmountOnState = (maxAmount, getAmount, buyAmount) => {
    const { getCurrency } = this.state
    const decimalPlaces = constants.tokenDecimals[getCurrency.toLowerCase()]

    this.setState(() => ({
      maxAmount: Number(maxAmount),
      getAmount: BigNumber(getAmount).dp(decimalPlaces).toString(),
      maxBuyAmount: buyAmount,
    }))

    return BigNumber(getAmount).isLessThanOrEqualTo(maxAmount)
  }

  setAmount = (value) => {
    this.setState(() => ({ haveAmount: value, maxAmount: 0 }))
  }

  setOrders = async () => {
    const { filteredOrders, haveAmount, exHaveRate, exGetRate } = this.state

    if (filteredOrders.length === 0) {
      this.setNoOfferState()
      return
    }

    this.setState(() => ({
      isSearching: true,
    }))

    const sortedOrders = filteredOrders
      .sort((a, b) => Number(b.buyAmount.dividedBy(b.sellAmount)) - Number(a.buyAmount.dividedBy(a.sellAmount)))
      .map((item, index) => {

        const exRate = item.buyAmount.dividedBy(item.sellAmount)
        const getAmount = BigNumber(haveAmount).dividedBy(exRate).toString()

        return {
          sellAmount: item.sellAmount,
          buyAmount: item.buyAmount,
          exRate,
          getAmount,
          orderId: item.id,
          peer: item.owner.peer,
        }
      })

    this.getUsdBalance()

    const didFound = await this.setOrderOnState(sortedOrders)

    if (didFound) {
      this.setState(() => ({
        isSearching: false,
      }))
    }
  }

  setOrderOnState = (orders) => {
    const { exHaveRate, exGetRate, haveAmount, getCurrency, estimatedFeeValues } = this.state

    let maxAllowedSellAmount = BigNumber(0)
    let maxAllowedGetAmount = BigNumber(0)
    let maxAllowedBuyAmount = BigNumber(0)

    let isFound = false
    let newState = {}

    const findGoodOrder = (inOrders) => {
      inOrders.forEach(item => {
        maxAllowedSellAmount = (maxAllowedSellAmount.isLessThanOrEqualTo(item.sellAmount)) ? item.sellAmount : maxAllowedSellAmount
        maxAllowedBuyAmount = (maxAllowedBuyAmount.isLessThanOrEqualTo(item.buyAmount)) ? item.buyAmount : maxAllowedBuyAmount

        if (BigNumber(haveAmount).isLessThanOrEqualTo(item.buyAmount)) {

          maxAllowedGetAmount = (maxAllowedGetAmount.isLessThanOrEqualTo(item.getAmount)) ? BigNumber(item.getAmount) : maxAllowedGetAmount

          const haveUsd = BigNumber(exHaveRate).times(haveAmount)
          const getUsd  = BigNumber(exGetRate).times(item.getAmount)

          isFound = true

          newState = {
            haveUsd: Number(haveUsd).toFixed(2),
            getUsd: Number(getUsd).toFixed(2),
            isNonOffers: false,
            goodRate: item.exRate,
            peer: item.peer,
            orderId: item.orderId,
          }
        }
      })
    }

    findGoodOrder(orders.filter(order => !this.isPeerBanned(order.peer)))

    // Если не нашли предложечение, проверим забаненые пиры
    if (!isFound) {
      findGoodOrder(orders.filter(order => this.isPeerBanned(order.peer)))
    }

    if (isFound) {
      this.setState(() => (newState))
    } else {
      this.setState(() => ({
        isNonOffers: true,
        getUsd: Number(0).toFixed(2),
      }))
    }

    const checkAmount = this.setAmountOnState(maxAllowedSellAmount, maxAllowedGetAmount, maxAllowedBuyAmount)

    if (!checkAmount) {
      this.setNoOfferState()
    }
    return true
  }

  handleCustomWalletUse = () => {
    const { customWalletUse } = this.state

    const newCustomWalletUse = !customWalletUse

    this.setState({
      customWalletUse: newCustomWalletUse,
      customWallet: (newCustomWalletUse === false) ? '' : this.getSystemWallet(),
    })
  }

  handleSetGetValue = ({ value }) => {
    const { haveCurrency, getCurrency, customWalletUse } = this.state

    if (value === haveCurrency) {
      this.handleFlipCurrency()
    } else {
      this.setState(() => ({
        getCurrency: value,
        haveCurrency,
        customWallet: customWalletUse ? this.getSystemWallet() : '',
      }))
      this.additionalPathing(haveCurrency, value)
      actions.analytics.dataEvent({
        action: 'exchange-click-selector',
        label: `${haveCurrency}-to-${getCurrency}`,
      })
    }
  }

  handleSetHaveValue = async ({ value }) => {
    const { haveCurrency, getCurrency, customWalletUse } = this.state

    if (value === getCurrency) {
      this.handleFlipCurrency()
    } else {
      this.setState({
        haveCurrency: value,
        getCurrency,
        customWallet: customWalletUse ? this.getSystemWallet() : '',
      }, () => {
        this.additionalPathing(value, getCurrency)
        actions.analytics.dataEvent({
          action: 'exchange-click-selector',
          label: `${haveCurrency}-to-${getCurrency}`,
        })

        this.checkPair()
        this.updateAllowedBalance()
      })
    }
  }

  handleFlipCurrency = async () => {
    const { haveCurrency, getCurrency, customWalletUse } = this.state

    this.setClearState()
    this.additionalPathing(getCurrency, haveCurrency)
    this.setState({
      haveCurrency: getCurrency,
      getCurrency: haveCurrency,
      customWallet: customWalletUse ? this.getSystemWallet(haveCurrency) : '',
    }, () => {
      actions.analytics.dataEvent({
        action: 'exchange-click-selector',
        label: `${haveCurrency}-to-${getCurrency}`,
      })
      this.checkPair()
      this.updateAllowedBalance()
    })
  }

  handlePush = (isWidget = false) => {
    const { intl: { locale } } = this.props
    const { haveCurrency, getCurrency } = this.state

    const currency = haveCurrency.toLowerCase()

    const pair = constants.tradeTicker
      .filter(ticker => {
        ticker = ticker.split('-')
        return currency === ticker[0].toLowerCase()
          ? ticker[0].toLowerCase() === currency
          : ticker[1].toLowerCase() === currency
      })
      .map(pair => {
        pair = pair.split('-')
        return {
          from: pair[0],
          to: pair[1],
        }
      })

    const sendLinkFrom = pair.filter(item => item.from === haveCurrency.toUpperCase() || item.from === getCurrency.toUpperCase())
    const sendLinkTo = pair.filter(item => item.to === haveCurrency.toUpperCase() || item.to === getCurrency.toUpperCase())

    const tradeTicker = `${sendLinkFrom[0].from.toLowerCase()}-${sendLinkTo[0].to.toLowerCase()}`

    const hostname = window.location.origin
    const pathname = constants.tradeTicker.includes(tradeTicker.toUpperCase())
      ? tradeTicker
      : tradeTicker.split('-').reverse().join('-')

    if (isWidget) {
      window.parent.location.replace(`${hostname}/${pathname}`)
    } else {
      this.props.history.push(localisedUrl(locale, `/${tradeTicker}`))
    }
  }

  setClearState = () => {
    const { getCurrency, customWalletUse } = this.state

    this.setState(() => ({
      haveAmount: 0,
      haveUsd: 0,
      getUsd: 0,
      getAmount: '',
      maxAmount: 0,
      maxBuyAmount: BigNumber(0),
      peer: '',
      isNonOffers: false,
      isFetching: false,
      isDeclinedOffer: false,
      customWallet: customWalletUse ? this.wallets[getCurrency.toUpperCase()] : '',
    }))
  }

  getSystemWallet = (walletCurrency) => {
    const { getCurrency } = this.state

    return this.wallets[(walletCurrency) ? walletCurrency.toUpperCase() : getCurrency.toUpperCase()]
  }

  customWalletValid() {
    const { haveCurrency, getCurrency, customWallet } = this.state

    if (!this.customWalletAllowed()) return true

    if (getCurrency === 'btc') return util.typeforce.isCoinAddress.BTC(customWallet)

    return util.typeforce.isCoinAddress.ETH(customWallet)

  }

  customWalletAllowed() {
    const { haveCurrency, getCurrency } = this.state

    if (haveCurrency === 'btc') {
      // btc-token
      if (config.erc20[getCurrency] !== undefined) return true
      // btc-eth
      if (getCurrency === 'eth') return true
    }
    if (config.erc20[haveCurrency] !== undefined) {
      // token-btc
      if (getCurrency === 'btc') return true
    }

    if (haveCurrency === 'eth') {
      // eth-btc
      if (getCurrency === 'btc') return true
    }

    return false
  }

  checkPair = () => {
    const { getCurrency, haveCurrency } = this.state

    const noPairToken = (config && config.isWidget) ? config.erc20token : 'swap'

    const checkingValue = this.props.allCurrencyies.map(item => item.name).includes(haveCurrency.toUpperCase())
      ? haveCurrency : noPairToken

    const selected = actions.pairs.selectPairPartial(checkingValue)
    const check = selected.map(item => item.value).includes(getCurrency)

    if (!check) {
      this.chooseCurrencyToRender(selected)
    } else if (getCurrency === checkingValue) {
      this.chooseCurrencyToRender(selected)
    }
  }

  chooseCurrencyToRender = (selected) => {
    this.setState(() => ({
      getCurrency: selected[0].value,
    }))
  }

  updateAllowedBalance = async () => {
    await actions[this.state.haveCurrency].getBalance(this.state.haveCurrency)
  }

  changeBalance = (value) => {
    this.extendedControlsSet(false)
    this.setState({
      haveAmount: value,
    })
  }

  extendedControlsSet = (value) => {
    const { extendedControls } = this.state

    if (typeof value !== 'boolean') {
      return this.setState({ extendedControls: false })
    }
    if (extendedControls === value) {
      return false
    }
    return this.setState({ extendedControls: value })
  }

  doesComissionPreventThisOrder = () => {
    const { haveAmount, getAmount, haveCurrency, getCurrency, estimatedFeeValues } = this.state
    const isBtcHere = (haveCurrency === 'btc' || getCurrency === 'btc')

    if (!isBtcHere) {
      return false
    }
    const btcAmount = BigNumber(haveCurrency === 'btc' ? haveAmount : getAmount)
    if (btcAmount.isGreaterThan(estimatedFeeValues.btc)) {
      return false
    }
    return true
  }

  addressIsCorrect() {
    const { customWallet, isToken, getCurrency } = this.state

    if (isToken) {
      return isCoinAddress.ETH(customWallet)
    }

    return isCoinAddress[getCurrency.toUpperCase()](customWallet)
  }

  render() {
    const { currencies, addSelectedItems, currenciesData, tokensData, intl: { locale, formatMessage } } = this.props
    const { haveCurrency, getCurrency, isNonOffers, redirect, orderId, isSearching,
      isDeclinedOffer, isFetching, maxAmount, customWalletUse, customWallet, getUsd, haveUsd,
      maxBuyAmount, getAmount, goodRate, extendedControls, estimatedFeeValues, isToken, dynamicFee, haveAmount,
    } = this.state

    const haveCurrencyData = currenciesData.find(item => item.currency === haveCurrency.toUpperCase())
    const haveTokenData = tokensData.find(item => item.currency === haveCurrency.toUpperCase())
    const currentCurrency = haveCurrencyData || haveTokenData
    const { balance } = currentCurrency || 0

    const oneCryptoCost = maxBuyAmount.isLessThanOrEqualTo(0) ? BigNumber(0) : BigNumber(goodRate)
    const linked = Link.all(this, 'haveAmount', 'getAmount', 'customWallet')

    const isWidgetLink = this.props.location.pathname.includes('/exchange') && this.props.location.hash === '#widget'
    const isWidget = isWidgetBuild || isWidgetLink
    const availableAmount = estimatedFeeValues[haveCurrency.toLowerCase()] > 0 ? BigNumber(haveAmount).plus(estimatedFeeValues[haveCurrency.toLowerCase()]) : 0

    if (redirect) {
      return <Redirect push to={`${localisedUrl(locale, links.swap)}/${getCurrency}-${haveCurrency}/${orderId}`} />
    }

    const canDoOrder = !isNonOffers
      && BigNumber(getAmount).isGreaterThan(0)
      && this.customWalletValid()
      && !this.doesComissionPreventThisOrder()
      && (BigNumber(haveAmount).isGreaterThan(balance) || BigNumber(balance).isGreaterThanOrEqualTo(availableAmount))

    const sellTokenFullName = currenciesData.find(item => item.currency === haveCurrency.toUpperCase())
      ? currenciesData.find(item => item.currency === haveCurrency.toUpperCase()).fullName
      : haveCurrency.toUpperCase()
    const buyTokenFullName = currenciesData.find(item => item.currency === getCurrency.toUpperCase())
      ? currenciesData.find(item => item.currency === getCurrency.toUpperCase()).fullName
      : getCurrency.toUpperCase()

    const SeoValues = {
      full_name1: sellTokenFullName,
      ticker_name1: haveCurrency.toUpperCase(),
      full_name2: buyTokenFullName,
      ticker_name2: getCurrency.toUpperCase(),
    }
    const TitleTagString = formatMessage({
      id: 'PartialClosureTitleTag',
      defaultMessage: 'Atomic Swap {full_name1} ({ticker_name1}) to {full_name2} ({ticker_name2}) Instant Exchange',
    }, SeoValues)
    const MetaDescriptionString = formatMessage({
      id: 'PartialClosureMetaDescrTag',
      defaultMessage: 'Best exchange rate for {full_name1} ({ticker_name1}) to {full_name2} ({ticker_name2}). Swap.Online wallet provides instant exchange using Atomic Swap Protocol.', // eslint-disable-line
    }, SeoValues)

    return (
      <Fragment>
        <Helmet>
          <title>{TitleTagString}</title>
          <meta
            name="description"
            content={MetaDescriptionString}
          />
        </Helmet>
        {
          (!isWidget) && (
            <div styleName="TitleHolder">
              <PageHeadline subTitle={subTitle(sellTokenFullName, haveCurrency.toUpperCase(), buyTokenFullName, getCurrency.toUpperCase())} />
            </div>
          )
        }
        <div styleName={isWidgetLink ? 'widgetSection' : 'section'} className={isWidgetLink ? 'section' : ''} >
          {
            (!isWidget) && (
              <Advantages />
            )
          }
          <div styleName="block" className={isWidget ? 'block' : ''} >
            <SelectGroup
              dataTut="have"
              balance={balance}
              extendedControls={extendedControls}
              inputValueLink={linked.haveAmount.pipe(this.setAmount)}
              selectedValue={haveCurrency}
              onSelect={this.handleSetHaveValue}
              label={<FormattedMessage id="partial243" defaultMessage="You sell" />}
              id="partialClosure456"
              tooltip={<FormattedMessage id="partial462" defaultMessage="The amount you have in your wallet or external wallet that you want to exchange" />}
              idFee="partialClosure794"
              tooltipAboutFee={<FormattedMessage id="partial795" defaultMessage="Available balance is your balance minus the miners commission will appear" />}
              placeholder="Enter amount"
              usd={(maxAmount > 0 && isNonOffers) ? 0 : haveUsd}
              currencies={currencies}
              className={isWidget ? 'SelGroup' : ''}
              onFocus={() => this.extendedControlsSet(true)}
              onBlur={() => setTimeout(() => this.extendedControlsSet(false), 200)}
              dynamicFee={dynamicFee}
              isToken={isToken}
              haveAmount={haveAmount}
            />
            {
              (extendedControls) && (
                <p className={isWidget ? 'advice' : ''} styleName="maxAmount">
                  <FormattedMessage id="partial221" defaultMessage="Max amount for exchange: " />
                  {Math.floor(maxBuyAmount.toNumber() * 1000) / 1000}{' '}{haveCurrency.toUpperCase()}
                </p>
              )
            }
            {
              haveCurrency !== getCurrency && (
                <div className={isWidget ? 'flipBtn' : ''}>
                  {
                    (extendedControls && balance > 0)
                      ? (
                        <div styleName="extendedControls">
                          <Select
                            all
                            estimatedFeeValues={estimatedFeeValues[haveCurrency.toLowerCase()]}
                            changeBalance={this.changeBalance}
                            balance={balance}
                            currency={haveCurrency}
                            switching={this.handleFlipCurrency}
                            isExchange
                            maxAmountForExchange={Math.floor(maxBuyAmount.toNumber() * 1000) / 1000}
                          />
                        </div>
                      )
                      : (
                        <Flip onClick={this.handleFlipCurrency} styleName="flipButton" />
                      )
                  }
                </div>
              )
            }
            <SelectGroup
              dataTut="get"
              inputValueLink={linked.getAmount}
              selectedValue={getCurrency}
              onSelect={this.handleSetGetValue}
              label={<FormattedMessage id="partial255" defaultMessage="You get" />}
              id="partialClosure472"
              tooltip={<FormattedMessage id="partial478" defaultMessage="The amount you receive after the exchange" />}
              disabled
              currencies={addSelectedItems}
              usd={getUsd}
              className={isWidget ? 'SelGroup' : ''}
            />
            {
              (isSearching || (isNonOffers && maxAmount === 0)) && (
                <span className={isWidget ? 'searching' : ''} data-tut="status">
                  <FormattedMessage id="PartialPriceSearch" defaultMessage="Searching orders..." />
                  <div styleName="loaderHolder">
                    <div styleName="additionalLoaderHolder">
                      <InlineLoader />
                    </div>
                  </div>
                </span>
              )
            }
            { oneCryptoCost.isGreaterThan(0) && oneCryptoCost.isFinite() && !isNonOffers && (
              <div className={isWidget ? 'priceSearch' : ''}>
                <FormattedMessage
                  id="PartialPriceSearch502"
                  defaultMessage="Price: 1 {getCurrency} = {haveCurrency}"
                  values={{ getCurrency: `${getCurrency.toUpperCase()}`, haveCurrency: `${oneCryptoCost.toFixed(5)} ${haveCurrency.toUpperCase()}` }}
                />
              </div>
            )}
            { !oneCryptoCost.isFinite() && !isNonOffers && (
              <FormattedMessage id="PartialPriceCalc" defaultMessage="Calc price" />
            )}
            {maxAmount > 0 && isNonOffers && linked.haveAmount.value > 0 && (
              <Fragment>
                <p styleName="error" className={isWidget ? 'error' : ''} >
                  <FormattedMessage id="PartialPriceNoOrdersReduce" defaultMessage="No orders found, try to reduce the amount" />
                </p>
                <p styleName="error" className={isWidget ? 'error' : ''} >
                  <FormattedMessage id="PartialPriceReduceMin" defaultMessage="Maximum available amount: " />
                  {maxAmount}{' '}{getCurrency.toUpperCase()}
                </p>
              </Fragment>
            )}
            {isDeclinedOffer && (
              <p styleName="error" className={isWidget ? 'error' : ''} >
                <FormattedMessage
                  id="PartialOfferCantProceed1"
                  defaultMessage="Request is declined. {link}"
                  values={{
                    link: (
                      <a href="https://wiki.swap.online/faq/#swap-faq-5738" target="_blank" rel="noopener noreferrer">
                        <FormattedMessage id="PartialOfferCantProceed1_1" defaultMessage="Why?" />
                      </a>
                    ),
                  }}
                />
              </p>
            )}
            {(this.doesComissionPreventThisOrder()
              && BigNumber(getAmount).isGreaterThan(0)
              && (this.state.haveAmount && this.state.getAmount)
            ) && (
              <p styleName="error" className={isWidget ? 'error' : ''} >
                <FormattedMessage
                  id="ErrorBtcLowAmount"
                  defaultMessage="{btcAmount} BTC - This amount is too low"
                  values={{
                    btcAmount: this.state.haveCurrency === 'btc' ? this.state.haveAmount : this.state.getAmount,
                  }}
                />
              </p>
            )}
            {
              isFetching && (
                <span className={isWidget ? 'wait' : ''}>
                  <FormattedMessage id="partial291" defaultMessage="Wait participant: " />
                  <div styleName="loaderHolder">
                    <div styleName="additionalLoaderHolder">
                      <InlineLoader />
                    </div>
                  </div>
                </span>
              )
            }

            {
              (this.customWalletAllowed() && !isWidget) && (
                <Fragment>
                  <div styleName="walletToggle walletToggle_site" data-tut="togle">
                    <Toggle checked={!customWalletUse} onChange={this.handleCustomWalletUse} />
                    {
                      !isWidget && (
                        <FormattedMessage id="UseAnotherWallet" defaultMessage="Specify your receiving wallet address" />
                      )
                    }
                  </div>
                  <div styleName={!customWalletUse ? 'anotherRecepient anotherRecepient_active' : 'anotherRecepient'}>
                    <FieldLabel>
                      <strong>
                        <FormattedMessage id="PartialYourWalletAddress" defaultMessage="Receiving wallet address" />
                      </strong>
                      &nbsp;
                      <Tooltip id="PartialClosure">
                        <FormattedMessage id="PartialClosure" defaultMessage="The wallet address to where cryptocurrency will be sent after the exchange" />
                      </Tooltip >
                    </FieldLabel>
                    <div styleName="walletInput">
                      <Input required disabled={customWalletUse} valueLink={linked.customWallet} pattern="0-9a-zA-Z" placeholder="Enter the destination address" />
                      {customWallet.length !== 0 && !this.addressIsCorrect() && (
                        <div styleName="notCorrect">
                          <FormattedMessage
                            id="Partial955"
                            defaultMessage="Address not correct" />
                        </div>
                      )}
                    </div>
                  </div>
                </Fragment>
              )
            }
            {
              (this.customWalletAllowed() && isWidget) && (
                <Fragment>
                  <FieldLabel>
                    <strong>
                      <FormattedMessage id="PartialYourWalletAddress" defaultMessage="Receiving wallet address" />
                    </strong>
                    &nbsp;
                    <Tooltip id="PartialClosure">
                      <FormattedMessage id="PartialClosure" defaultMessage="The wallet address to where cryptocurrency will be sent after the exchange" />
                    </Tooltip >
                  </FieldLabel>
                  <div styleName="walletInput">
                    <Input required disabled={customWalletUse} valueLink={linked.customWallet} pattern="0-9a-zA-Z" placeholder="Enter the destination address" />
                  </div>
                  <div styleName="walletToggle">
                    <Toggle dataTut="togle" checked={customWalletUse} onChange={this.handleCustomWalletUse} />
                    {
                      isWidgetBuild && (
                        <FormattedMessage id="PartialUseInternalWallet" defaultMessage="Use internal wallet" />
                      )
                    }
                    {
                      isWidgetLink && (
                        <FormattedMessage id="PartialUseSwapOnlineWallet" defaultMessage="Use Swap.Online wallet" />
                      )
                    }
                  </div>
                </Fragment>
              )
            }
            <div styleName="rowBtn" className={isWidget ? 'rowBtn' : ''}>
              <Button styleName="button" brand onClick={this.handleGoTrade} dataTut="Exchange" disabled={!canDoOrder}>
                <FormattedMessage id="partial541" defaultMessage="Exchange now" />
              </Button>
              <Button styleName="button" gray dataTut="Orderbook" onClick={() => this.handlePush(isWidgetLink)} >
                <FormattedMessage id="partial544" defaultMessage="Orderbook" />
              </Button>
            </div>
            <br />
            {
              BigNumber(estimatedFeeValues[haveCurrency]).isGreaterThan(0)
              && BigNumber(haveAmount).isGreaterThan(0)
              && BigNumber(haveAmount).isLessThanOrEqualTo(balance)
              && (
                <div className={isWidget ? 'feeValue' : ''}>
                  <FormattedMessage
                    id="PartialFeeValueWarn"
                    defaultMessage="You will have to pay an additional miner fee up to {estimatedFeeValue} {haveCurrency}"
                    values={{ haveCurrency: haveCurrency.toUpperCase(), estimatedFeeValue: estimatedFeeValues[haveCurrency] }}
                  />
                </div>
              )
            }
          </div>
        </div>
        {
          (!isWidget) && (
            <p styleName="inform">
              <Referral address={this.props.userEthAddress} />
              <FormattedMessage
                id="PartialClosure562"
                defaultMessage="Swap.online is a decentralized hot wallet powered by Atomic swap technology.
                Exchange Bitcoin, USD Tether, BCH, EOS within seconds.

                No commission for exchange (only miners fee).


                Swap.Online uses IPFS-network for all the operational processes which results in no need for centralized server.

                The interface of exchange seems to look like that of crypto broker, not of ordinary DEX or CEX. In a couple of clicks, the user can place and take the offer,
                customizing the price of sent token.


                Also, the user can exchange the given percentage of his or her amount of tokens available (e.g. ½, ¼ etc.).


                One more advantage of the Swap.Online exchange service is the usage of one key for the full range of ERC-20 tokens.

                By the way, if case you’re not interested in exchange of some tokens, you can hide it from the list.

                Thus, use Swap.Online as your basic exchange for every crypto you’re holding!"
                values={{
                  br: <br />,
                }}
              />
            </p>
          )
        }
      </Fragment>
    )
  }
}
