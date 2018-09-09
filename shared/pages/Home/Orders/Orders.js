import React, { Component, Fragment } from 'react'
import { connect } from 'redaction'

import Row from './Row/Row'
import Table from 'components/tables/Table/Table'
import styles from 'components/tables/Table/Table.scss'
import MyOrders from './MyOrders/MyOrders'
import SearchSwap from 'components/SearchSwap/SearchSwap'


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
export default class Orders extends Component {

  render() {
    const { sellCurrency, buyCurrency, handleSellCurrencySelect, handleBuyCurrencySelect, flipCurrency, currencies } = this.props
    const titles = [ 'OWNER', 'EXCHANGE', 'YOU GET', 'YOU HAVE', 'EXCHANGE RATE', 'ACTIONS' ]
    const { isOnline, orders, myOrders, orderId } = this.props

    return (
      <Fragment>
        <MyOrders myOrders={myOrders} />
        <SearchSwap
          handleSellCurrencySelect={handleSellCurrencySelect}
          handleBuyCurrencySelect={handleBuyCurrencySelect}
          buyCurrency={buyCurrency}
          sellCurrency={sellCurrency}
          flipCurrency={flipCurrency}
          currencies={currencies}
        />
        <h3>All orders</h3>
        <Table
          classTitle={styles.exchange}
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
      </Fragment>
    )
  }
}
