import React, { Component, Fragment } from 'react'

import Link from 'sw-valuelink'
import { links } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './PartialClosure.scss'

import { connect } from 'redaction'
import actions from 'redux/actions'
import { BigNumber } from 'bignumber.js'

import SelectGroup from './SelectGroup/SelectGroup'
import { Button, Toggle } from 'components/controls'
import { Redirect } from 'react-router-dom'


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
      haveAmount: '',
      getAmount: '',
      peer: '',
      filteredOrders: [],
      isNonOffers: false,
      isDeclinedOffer: false,
    }
  }

  static getDerivedStateFromProps({ orders }, { haveCurrency }) {
    if (!Array.isArray(orders)) { return }

    const filteredOrders = orders.filter(order =>
      order.sellCurrency === haveCurrency.toUpperCase())

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
      buyCurrency: getCurrency,
      sellCurrency: haveCurrency,
      sellAmount: haveAmount,
      buyAmount: getAmount,
    }

    actions.core.requestToPeer('request partial closure', peer, { order, orderId }, (orderId) => {
      console.log('orderId', orderId)
      // TODO change callback on boolean type
      if (orderId) {
        actions.core.sendRequest(orderId, (isAccept) => {
          if (isAccept) {
            this.setState(() => ({
              redirect: true,
              orderId,
            }))
          }
        })
      } else {
        this.setState(() => ({ isDeclinedOffer: true, haveAmount: '' }))
      }
    })
  }

  setAmount = (value) => {
    this.setState(() => ({ haveAmount: new BigNumber(String(value)) }))

    const { filteredOrders } = this.state

    console.log('value', value)
    console.log('filteredOrders', filteredOrders)

    if (filteredOrders.length === 0) {
      this.setState(() => ({ isNonOffers: true }))
      return
    }

    // TODO add check orders and view
    const sortedOrder = filteredOrders.sort((a, b) => a.exchangeRate - b.exchangeRate)
    const exRate = new BigNumber(String(sortedOrder[0].exchangeRate))

    console.log('exRate', exRate)
    console.log('sortedOrder', sortedOrder)

    this.setState(() => ({
      isNonOffers: false,
      getAmount: exRate.multipliedBy(new BigNumber(String(value))),
      peer: sortedOrder[0].owner.peer,
      orderId: sortedOrder[0].id,
    }))
  }

  render() {
    const { currencies } = this.props
    const { haveCurrency, getCurrency, isNonOffers, redirect, orderId, isDeclinedOffer, type } = this.state

    const linked = Link.all(this, 'haveAmount', 'getAmount')

    if (redirect) {
      return <Redirect push to={`${links.swap}/${getCurrency}-${haveCurrency}/${orderId}`} />
    }

    return (
      <Fragment>
        <h1>Partial Closure</h1>
        <div style={{ width: '400px', margin: '0 auto' }}>
          <SelectGroup
            inputValueLink={linked.haveAmount.pipe(this.setAmount)}
            selectedValue={haveCurrency}
            onSelect={({ value }) => this.setState(() => ({ haveCurrency: value }))}
            label="You have"
            placeholder="Enter amount"
            currencies={currencies}
          />
          <SelectGroup
            inputValueLink={linked.getAmount}
            selectedValue={getCurrency}
            onSelect={({ value }) => this.setState(() => ({ getCurrency: value }))}
            label="You get"
            disabled
            currencies={currencies}
          />
          {
            isDeclinedOffer && (<p>Offer is declined</p>)
          }
          {
            isNonOffers && (<p style={{ color: 'red' }}>No offers </p>)
          }
          <Button styleName="button" brand fullWidth onClick={this.sendRequest} disabled={isNonOffers}>
            Start
          </Button>
        </div>
      </Fragment>
    )
  }
}
