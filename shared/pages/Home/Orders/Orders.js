import React, { Component, Fragment } from 'react'

import { connect } from 'redaction'
import actions from 'redux/actions'

import constants from 'helpers/constants'

import cssModules from 'react-css-modules'
import styles from './Orders.scss'

import { Button } from 'components/controls'
import Table from 'components/tables/Table/Table'
import Title from 'components/PageHeadline/Title/Title'
import tableStyles from 'components/tables/Table/Table.scss'

import Pair from './Pair'
import Row from './Row/Row'
import MyOrders from './MyOrders/MyOrders'


const filterMyOrders = (orders, peer) => orders
  .filter(order => order.owner.peer === peer)

const filterOrders = (orders, filter) => orders
  .filter(order => Pair.check(order, filter))
  .sort((a, b) => Pair.compareOrders(b, a))

@connect(({
  core: { orders, filter },
  ipfs: { isOnline, peer },
  currencies: { items: currencies },
}) => ({
  orders: filterOrders(orders, filter),
  myOrders: filterMyOrders(orders, peer),
  isOnline,
  currencies,
}))
@cssModules(styles)
export default class Orders extends Component {

  state = {
    buyOrders: [],
    sellOrders: [],
  }

  static getDerivedStateFromProps({ orders }) {
    if (!Array.isArray(orders)) { return }

    const sellOrders = orders
      .filter(order => Pair.fromOrder(order).isAsk())

    const buyOrders = orders
      .filter(order => Pair.fromOrder(order).isBid())

    return {
      buyOrders,
      sellOrders,
    }
  }

  createOffer = () => {
    actions.modals.open(constants.modals.Offer, {
      buyCurrency: this.props.buyCurrency,
      sellCurrency: this.props.sellCurrency,
    })
    actions.analytics.dataEvent('orderbook-click-createoffer-button')
  }

  removeOrder = (orderId) => {
    actions.core.removeOrder(orderId)
    actions.core.updateCore()
  }

  acceptRequest = (orderId, peer) => {
    actions.core.acceptRequest(orderId, peer)
    actions.core.updateCore()
  }

  declineRequest = (orderId, peer) => {
    actions.core.declineRequest(orderId, peer)
    actions.core.updateCore()
  }

  render() {
    const { sellOrders, buyOrders } = this.state
    let { sellCurrency, buyCurrency } = this.props
    buyCurrency = buyCurrency.toUpperCase()
    sellCurrency = sellCurrency.toUpperCase()

    const titles = [ 'OWNER', `${buyCurrency}`, `? ${sellCurrency} = 1 ${buyCurrency}`, `${sellCurrency}`, 'START EXCHANGE' ]
    const { isOnline, myOrders, orderId, invalidPair } = this.props

    return (
      <Fragment>
        <Title>{buyCurrency}/{sellCurrency} no limit exchange with 0 fee</Title>
        { invalidPair && <p> No such ticker. Redirecting to SWAP-BTC exchange... </p> }
        <MyOrders
          myOrders={myOrders}
          declineRequest={this.declineRequest}
          removeOrder={this.removeOrder}
          acceptRequest={this.acceptRequest}
        />
        <Button gray styleName="button" onClick={this.createOffer}>Create offer</Button>

        <h3>Buy {buyCurrency} for {sellCurrency}</h3>
        <Table
          id="table_exchange"
          classTitle={tableStyles.exchange}
          titles={titles}
          rows={sellOrders}
          rowRender={(row, index) => (
            <Row
              key={index}
              orderId={orderId}
              row={row}
            />
          )}
          isLoading={!isOnline}
        />

        <h3>Sell {sellCurrency} for {buyCurrency}</h3>
        <Table
          id="table_exchange"
          classTitle={tableStyles.exchange}
          titles={titles}
          rows={buyOrders}
          rowRender={(row, index) => (
            <Row
              key={index}
              orderId={orderId}
              row={row}
            />
          )}
          isLoading={!isOnline}
        />
      </Fragment>
    )
  }
}
