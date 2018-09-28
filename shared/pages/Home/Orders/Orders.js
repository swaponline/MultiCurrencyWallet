import React, { Component, Fragment } from 'react'
import cssModules from 'react-css-modules'
import { connect } from 'redaction'
import actions from 'redux/actions'
import constants from 'helpers/constants'

import Row from './Row/Row'
import Table from 'components/tables/Table/Table'
import tableStyles from 'components/tables/Table/Table.scss'
import MyOrders from './MyOrders/MyOrders'
import SwapCurrencyChooser from 'components/SwapCurrencyChooser/SwapCurrencyChooser'
import Button from 'components/controls/Button/Button'

import styles from './Orders.scss'


const filterMyOrders = (orders, peer) => orders.filter(order => order.owner.peer === peer)

const filterOrders = (orders, filter) => orders
  .filter(order => order.isMy ? (
    `${order.buyCurrency.toLowerCase()}-${order.sellCurrency.toLowerCase()}` === filter
  ) : (
    `${order.sellCurrency.toLowerCase()}-${order.buyCurrency.toLowerCase()}` === filter
  ))
  .sort((a, b) => b.exchangeRate - a.exchangeRate)

@connect(({  core: { orders, filter }, ipfs: { isOnline, peer }, currencies: { items: currencies } }) => ({
  orders: filterOrders(orders, filter),
  myOrders: filterMyOrders(orders, peer),
  isOnline,
  currencies,
}))
@cssModules(styles)
export default class Orders extends Component {

  createOffer = () => {
    actions.modals.open(constants.modals.Offer, {
      buyCurrency: this.props.buyCurrency,
      sellCurrency: this.props.sellCurrency,
    })
    actions.analytics.dataEvent('orderbook-click-createoffer-button')
  }

  render() {
    const { sellCurrency, buyCurrency, handleSellCurrencySelect, handleBuyCurrencySelect, flipCurrency, currencies } = this.props
    const titles = [ 'OWNER', 'EXCHANGE', 'YOU GET', 'YOU HAVE', 'EXCHANGE RATE', 'ACTIONS' ]
    const { isOnline, orders, myOrders, orderId } = this.props

    return (
      <Fragment>
        <MyOrders myOrders={myOrders} />
        <div styleName="allOrders">
          <h3>All orders</h3>
          <Table
            classTitle={tableStyles.exchange}
            titles={titles}
            rows={orders}
            rowRender={(row, index) => (
              <Row
                key={index}
                orderId={orderId}
                row={row}
              />
            )}
            isLoading={!isOnline}
          />
        </div>
      </Fragment>
    )
  }
}
