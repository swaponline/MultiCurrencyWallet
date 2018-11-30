import React, { Component, Fragment } from 'react'

import Link from 'sw-valuelink'
import { links } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './PartialClosure.scss'

import { connect } from 'redaction'
import actions from 'redux/actions'
import { BigNumber } from 'bignumber.js'
import { Redirect } from 'react-router-dom'

import SelectGroup from './SelectGroup/SelectGroup'
import { Button, Toggle, Flip } from 'components/controls'
import Input from 'components/forms/Input/Input'
import Tooltip from 'components/ui/Tooltip/Tooltip'

import PageHeadline from 'components/PageHeadline/PageHeadline'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'

import config from 'app-config'


const filterIsPartial = (orders) => orders
  .filter(order => order.isPartialClosure)


@connect(({ currencies, core: { orders } }) => ({
  currencies: currencies.items,
  orders: filterIsPartial(orders),
}))
@CSSModules(styles)
export default class PartialClosure extends Component {

  static defaultProps = {
    orders: [],
  }

  constructor() {
    super()

    this.state = {
      haveCurrency: 'btc',
      getCurrency: 'eth',
      haveAmount: 0,
      haveUsd: 0,
      getUsd: 0,
      getAmount: '',
      maxAmount: 0,
      peer: '',
      filteredOrders: [],
      isNonOffers: false,
      isFetching: false,
      isDeclinedOffer: false,
      customWalletUse: false,
      customWallet: '',
    }

    let timer
  }

  componentDidMount() {
    this.getUsdBalance()

    this.timer = setInterval(() => {
      this.setOrders()
    }, 2000)
  }

  componentWillUnmount() {
    clearInterval(this.timer)
  }
  shouldComponentUpdate(nextPros) {
    if (nextPros.orders && this.props.orders && nextPros.orders > 0) {
      if (nextPros.orders.length === this.props.orders.length) {
        return false
      }
    }
    return true
  }

  static getDerivedStateFromProps({ orders }, { haveCurrency, getCurrency }) {
    if (!Array.isArray(orders)) { return }

    const filteredOrders = orders.filter(order => !order.isMy
      && order.sellCurrency === getCurrency.toUpperCase()
      && order.buyCurrency === haveCurrency.toUpperCase())

    return {
      filteredOrders,
    }
  }

  getUsdBalance = async () => {
    const { haveCurrency, getCurrency } = this.state

    const exHaveRate = await actions.user.getExchangeRate(haveCurrency, 'usd')
    const exGetRate = await actions.user.getExchangeRate(getCurrency, 'usd')

    console.log('exHaveRate', exHaveRate)
    console.log('exGetRate', exGetRate)

    this.setState(() => ({
      exHaveRate,
      exGetRate,
    }))
  }

  sendRequest = () => {
    const {
      getAmount, haveAmount, haveCurrency, getCurrency,
      peer, orderId, customWalletUse, customWallet,
    } = this.state

    if (!String(getAmount) || !peer || !orderId || !String(haveAmount)) {
      return
    }

    // Тут важный момент.... так как в данной реализации поля для ордера формирует
    // покупатель.... и продавец использует эту структуру чтобы создать ордер -
    // то используем Sell (продавец будет знать, куда продавать)
    const order = {
      buyCurrency: haveCurrency,
      sellCurrency: getCurrency,
      sellAmount: getAmount,
      buyAmount: haveAmount,
      destinationSellAddress: (customWalletUse && this.customWalletAllowed()) ? customWallet : null,
    }

    this.setState(() => ({ isFetching: true }))

    actions.core.requestToPeer('request partial closure', peer, { order, orderId }, (orderId) => {
      console.log('orderId', orderId)
      // TODO change callback on boolean type
      if (orderId) {
        actions.core.sendRequest(orderId, (isAccept) => {
          if (isAccept) {
            this.setState(() => ({
              redirect: true,
              isFetching: false,
              orderId,
            }))
          } else {
            this.setDeclinedOffer()
          }
        })
      } else {
        this.setDeclinedOffer()
      }
    })
  }

  setDeclinedOffer = () => {
    this.setState(() => ({ haveAmount: '', isFetching: false, isDeclinedOffer: true }))

    setTimeout(() => {
      this.setState(() => ({
        isDeclinedOffer: false,
      }))
    }, 5000)
  }

  setNoOfferState = () => {
    this.setState(() => ({ isNonOffers: true }))
  }

  setAmountOnState = (maxAmount, getAmount) => {

    console.log('maxAmount', Number(maxAmount))
    console.log('getAmount', this.getFixed(getAmount))

    this.setState(() => ({
      maxAmount: Number(maxAmount),
      getAmount: this.getFixed(getAmount),
    }))

    return getAmount.isLessThanOrEqualTo(maxAmount)
  }

  getFixed = (value) => Number(value).toFixed(5)

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

    console.log('filteredOrders', filteredOrders)

    const sortedOrder = filteredOrders
      .sort((a, b) => Number(a.buyAmount.dividedBy(a.sellAmount)) - Number(b.buyAmount.dividedBy(b.sellAmount)))
      .map((item, index) => {

        const exRate = item.buyAmount.dividedBy(item.sellAmount)
        const getAmount = new BigNumber(String(haveAmount)).dividedBy(exRate)

        const haveUsd = new BigNumber(String(exHaveRate)).multipliedBy(haveAmount)
        const getUsd  = new BigNumber(String(exGetRate)).multipliedBy(getAmount)

        this.setState(() => ({
          haveUsd: Number(haveUsd).toFixed(2),
          getUsd: Number(getUsd).toFixed(2),
        }))

        return {
          sellAmount: item.sellAmount,
          buyAmount: item.buyAmount,
          exRate,
          getAmount,
          orderId: item.id,
          peer: item.owner.peer,
        }
      })

    console.log('sortedOrder', sortedOrder)

    const search = await this.setOrderOnState(sortedOrder)

    console.log('search', search)

    if (search) {
      this.setState(() => ({
        isSearching: false,
      }))
    }
  }

  setOrderOnState = (orders) => {
    const { haveAmount } = this.state

    console.log('setOrderOnState', orders)

    orders.forEach(item => {
      console.log('item', item)

      const checkAmount = this.setAmountOnState(item.sellAmount, item.getAmount)

      if (!checkAmount) {
        console.log('checkAmount')
        this.setNoOfferState()
        return
      }

      if (haveAmount > Number(item.sellAmount)) {
        console.log('haveAmount', haveAmount, 'sellAmount', Number(item.sellAmount))
        this.setState(() => ({
          isNonOffers: false,
          peer: item.peer,
          orderId: item.id,
        }))
      }
    })

    return true
  }

  handleCustomWalletUse = () => {
    this.setState({
      customWalletUse: !this.state.customWalletUse,
    })
  }

  handleSetGetValue = ({ value }) => {
    let { getCurrency, haveCurrency } = this.state

    if (haveCurrency === value) {
      haveCurrency = getCurrency
    }

    this.setState(() => ({
      maxAmount: 0,
      haveCurrency,
      getCurrency: value,
    }))
  }

  handleSetHaveValue = ({ value }) => {
    let { getCurrency, haveCurrency } = this.state

    if (getCurrency === value) {
      getCurrency = haveCurrency
    }

    this.setState(() => ({
      maxAmount: 0,
      getCurrency,
      haveCurrency: value,
    }))
  }

  handleFlipCurrency = () => {
    this.setState(() => ({
      haveCurrency: this.state.getCurrency,
      getCurrency: this.state.haveCurrency,
    }))
  }

  handlePush = () => {
    const { haveCurrency, getCurrency } = this.state
    this.props.history.push(`${haveCurrency}-${getCurrency}`)
  }

  customWalletAllowed() {
    const { haveCurrency, getCurrency } = this.state

    if (haveCurrency === 'btc') {
      if (config.erc20[getCurrency] !== undefined) return true
    }

    return false
  }

  render() {
    const { currencies } = this.props
    const { haveCurrency, getCurrency, isNonOffers, redirect, orderId, isSearching,
      isDeclinedOffer, isFetching, maxAmount, customWalletUse, customWallet, getUsd, haveUsd,
    } = this.state

    const linked = Link.all(this, 'haveAmount', 'getAmount', 'customWallet')

    if (redirect) {
      return <Redirect push to={`${links.swap}/${getCurrency}-${haveCurrency}/${orderId}`} />
    }

    return (
      <Fragment>
        <PageHeadline subTitle="Fast cryptocurrency exchange using atomicswap" />
        <div styleName="section">
          <div styleName="blockVideo">
            <iframe
              title="swap online video"
              width="560"
              height="315"
              src="https://www.youtube-nocookie.com/embed/Jhrb7xOT_7s?controls=0"
              frameBorder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div styleName="block">
            <SelectGroup
              inputValueLink={linked.haveAmount.pipe(this.setAmount)}
              selectedValue={haveCurrency}
              onSelect={this.handleSetHaveValue}
              label="You sell"
              placeholder="Enter amount"
              usd={haveUsd}
              currencies={currencies}
            />
            <Flip onClick={this.handleFlipCurrency} styleName="flipButton" />
            <SelectGroup
              inputValueLink={linked.getAmount}
              selectedValue={getCurrency}
              onSelect={this.handleSetGetValue}
              label="You buy"
              disabled
              currencies={currencies}
              usd={getUsd}
            />
            {
              isSearching && (
                <span>
                  {` Wait search orders: `}
                  <InlineLoader />
                </span>
              )
            }
            {
              this.customWalletAllowed() && (
                <Fragment>
                  <div styleName="walletToggle">
                    <Toggle checked={!customWalletUse} onChange={this.handleCustomWalletUse} /> Use Swap.Online wallet
                    <Tooltip text="To change default wallet for buy currency. Leave empty for use Swap.Online wallet" />
                  </div>
                  { customWalletUse && (
                    <div styleName="walletInput">
                      <Input valueLink={linked.customWallet} pattern="0-9a-zA-Z" />
                    </div>
                  ) }
                </Fragment>
              )
            }
            <p>{`Max amount for offer:`} {maxAmount}{' '}{getCurrency.toUpperCase()}</p>
            {maxAmount > 0 && isNonOffers && (
              <p styleName="error">
                {`No orders found, try to reduce the amount`}
              </p>
            )}
            {isDeclinedOffer && (
              <p styleName="error">
                {`Offer is declined`}
              </p>
            )}
            {
              isFetching && (
                <span>
                  {` Wait participant: `}
                  <InlineLoader />
                </span>
              )
            }
            <div styleName="rowBtn">
              <Button styleName="button" brand onClick={this.sendRequest} disabled={isNonOffers}>
                {`Exchange now`}
              </Button>
              <Button styleName="button" gray onClick={this.handlePush} >
                {`Show order book`}
              </Button>
            </div>
          </div>
        </div>
      </Fragment>
    )
  }
}
