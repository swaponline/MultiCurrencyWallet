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
import { Button, Toggle } from 'components/controls'

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
      this.setAmount(this.state.haveAmount)
    }, 1000)
  }

  componentWillUnmount() {
    clearInterval(this.timer)
  }

  shouldComponentUpdate(nextPros, nextState) {
    if (nextPros.orders && nextState.orders) {
      return nextPros.orders.length !== nextState.orders.length
    }
    return true
  }

  static getDerivedStateFromProps({ orders }, { haveCurrency, getCurrency, haveAmount }) {
    if (!Array.isArray(orders)) { return }

    console.log('orders', orders)

    const filteredOrders = orders.filter(order => !order.isMy
      && order.sellCurrency === getCurrency.toUpperCase()
      && order.buyCurrency === haveCurrency.toUpperCase())

    return {
      filteredOrders,
    }
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
      getAmount,
    }))

    return getAmount.isLessThan(maxAmount)
  }

  setAmount = (value) => {
    this.setState(() => ({ haveAmount: value, maxAmount: 0 }))

    const { filteredOrders } = this.state

    if (filteredOrders.length === 0) {
      this.setNoOfferState()
      return
    }

    const sortedOrder = filteredOrders
      .sort((a, b) => Number(a.buyAmount.dividedBy(a.sellAmount)) - Number(b.buyAmount.dividedBy(b.sellAmount)))
    const exRate = sortedOrder[0].buyAmount.dividedBy(sortedOrder[0].sellAmount)
    const getAmount = new BigNumber(String(value)).dividedBy(exRate)

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
    }), this.setAmount(this.state.haveAmount))
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
    }), this.setAmount(this.state.haveAmount))
  }

  render() {
    const { currencies } = this.props
    const { haveCurrency, getCurrency, isNonOffers, redirect,
      orderId, isDeclinedOffer, isFetching, maxAmount } = this.state

    const linked = Link.all(this, 'haveAmount', 'getAmount')

    if (redirect) {
      return <Redirect push to={`${links.swap}/${getCurrency}-${haveCurrency}/${orderId}`} />
    }

    return (
      <Fragment>
        <PageHeadline subTitle="Partial closure offers" />
        <div styleName="section">
          <div styleName="block">
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
              label="You have"
              placeholder="Enter amount"
              currencies={currencies}
            />
            <p>Max amount for offer: {maxAmount}{' '}{getCurrency.toUpperCase()}</p>
            <SelectGroup
              inputValueLink={linked.getAmount}
              selectedValue={getCurrency}
              onSelect={this.handleSetGetValue}
              label="You get"
              disabled
              currencies={currencies}
            />
            {isNonOffers && (<p styleName="error">No offers </p>)}
            {isDeclinedOffer && (<p styleName="error">Offer is declined</p>)}
            {
              isFetching && (
                <span>
                  Wait participant:
                  <InlineLoader />
                </span>
              )
            }
            <Button styleName="button" brand fullWidth onClick={this.sendRequest} disabled={isNonOffers}>
              Start
            </Button>
          </div>
        </div>
      </Fragment>
    )
  }
}
