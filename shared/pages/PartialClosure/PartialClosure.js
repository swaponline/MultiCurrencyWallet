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

import PageHeadline from 'components/PageHeadline/PageHeadline'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'


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
      getAmount: '',
      maxAmount: 0,
      peer: '',
      filteredOrders: [],
      isNonOffers: false,
      isFetching: false,
      isDeclinedOffer: false,
    }

    let timer
  }

  componentDidMount() {
    this.timer = setInterval(() => {
      this.setOrders()
    }, 1000)

    this.getUsdBalance()
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
    const { haveCurrency, getCurrency, haveAmount, getAmount } = this.state

    const exHaveRate = await actions.user.getExchangeRate(haveCurrency, 'usd')
    const exGetRate = await actions.user.getExchangeRate(getCurrency, 'usd')

    const haveUsd = ((haveAmount || 0) * Number(exHaveRate)).toFixed(2)
    const getUsd = ((getAmount || 0) * Number(exGetRate)).toFixed(2)

    this.setState(() => ({
      haveUsd,
      getUsd,
    }))
  }

  sendRequest = () => {
    const { getAmount, haveAmount, haveCurrency, getCurrency, peer, orderId } = this.state

    if (!String(getAmount) || !peer || !orderId || !String(haveAmount)) {
      return
    }

    const order = {
      buyCurrency: haveCurrency,
      sellCurrency: getCurrency,
      sellAmount: getAmount,
      buyAmount: haveAmount,
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

    this.setState(() => ({
      maxAmount: String(maxAmount),
      getAmount: this.getFixed(getAmount),
    }))

    return getAmount.isLessThanOrEqualTo(maxAmount)
  }

  getFixed = (value) => Number(value).toFixed(5)

  setAmount = (value) => {
    this.setState(() => ({ haveAmount: value, maxAmount: 0 }))
    this.getUsdBalance()
  }

  setOrders = () => {
    const { filteredOrders } = this.state
    this.getUsdBalance()

    if (filteredOrders.length === 0) {
      this.setNoOfferState()
      return
    }

    const sortedOrder = filteredOrders
      .sort((a, b) => Number(a.buyAmount.dividedBy(a.sellAmount)) - Number(b.buyAmount.dividedBy(b.sellAmount)))
    const exRate = sortedOrder[0].buyAmount.dividedBy(sortedOrder[0].sellAmount)
    const getAmount = new BigNumber(String(this.state.haveAmount)).dividedBy(exRate)

    const checkAmount = this.setAmountOnState(sortedOrder[0].sellAmount, getAmount)

    if (!checkAmount) {
      this.setNoOfferState()
      return
    }

    this.setState(() => ({
      isNonOffers: false,
      peer: sortedOrder[0].owner.peer,
      orderId: sortedOrder[0].id,
    }), console.log(`this state ${this.state.getAmount} ${this.state.haveAmount}`))
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
    }), this.setOrders())
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
    }), this.setOrders())
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

  render() {
    const { currencies } = this.props
    const { haveCurrency, getCurrency, isNonOffers, redirect,
      orderId, isDeclinedOffer, isFetching, maxAmount, getUsd, haveUsd } = this.state

    const linked = Link.all(this, 'haveAmount', 'getAmount')

    if (redirect) {
      return <Redirect push to={`${links.swap}/${getCurrency}-${haveCurrency}/${orderId}`} />
    }

    return (
      <Fragment>
        <PageHeadline subTitle="Partial closure offers" />
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
              currencies={currencies}
              usd={haveUsd}
            />
            <Flip onClick={this.handleFlipCurrency} styleName="flipButton" />
            <SelectGroup
              inputValueLink={linked.getAmount}
              selectedValue={getCurrency}
              onSelect={this.handleSetGetValue}
              label="You buy"
              disabled
              usd={getUsd}
              currencies={currencies}
            />
            <p>{`Max amount for offer:`} {maxAmount}{' '}{getCurrency.toUpperCase()}</p>
            {maxAmount > 0 && isNonOffers && (
              <p styleName="error">
                {`No orders found, try to reduce the amount`}
              </p>
            )}
            {isDeclinedOffer && (<p styleName="error">{`Offer is declined`}</p>)}
            {
              isFetching && (
                <span>
                  {` Wait participant:`}
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
