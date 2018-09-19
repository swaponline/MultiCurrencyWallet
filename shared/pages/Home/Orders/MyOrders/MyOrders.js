import React, { PureComponent, Fragment } from 'react'

import actions from 'redux/actions'

import Table from 'components/tables/Table/Table'
import styles from 'components/tables/Table/Table.scss'
import RowFeeds from './RowFeeds/RowFeeds'


export default class MyOrders extends PureComponent {

  componentWillReceiveProps() {
    this.setState()
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
    const titles = [ 'EXCHANGE', 'YOU GET', 'YOU HAVE', 'EXCHANGE RATE', 'SHARE', 'ACTIONS' ]
    const { myOrders } = this.props

    if (myOrders.length === undefined || myOrders.length <= 0) {
      return null
    }

    return (
      <Fragment>
        <h3 style={{ marginTop: '50px' }} >Your orders</h3>
        <Table
          classTitle={styles.exchange}
          titles={titles}
          rows={myOrders}
          rowRender={(row, index) => (
            <RowFeeds
              key={index}
              row={row}
              declineRequest={this.declineRequest}
              acceptRequest={this.acceptRequest}
              removeOrder={this.removeOrder}
            />
          )}
        />
      </Fragment>
    )
  }
}
