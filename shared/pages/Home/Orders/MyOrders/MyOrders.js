import React, { PureComponent, Fragment } from 'react'

import actions from 'redux/actions'

import Table from 'components/tables/Table/Table'
import styles from 'components/tables/Table/Table.scss'
import RowFeeds from './RowFeeds/RowFeeds'
import { FormattedMessage } from 'react-intl'


export default class MyOrders extends PureComponent {

  render() {
    const titles = [ 'EXCHANGE', 'YOU GET', 'YOU HAVE', 'EXCHANGE RATE', 'SHARE', 'ACTIONS' ]
    const { myOrders, declineRequest, acceptRequest, removeOrder } = this.props

    if (myOrders.length === undefined || myOrders.length <= 0) {
      return null
    }

    return (
      <Fragment>
        <FormattedMessage id="MyOrders23" defaultMessage="Your orders">
          {message => <h3 style={{ marginTop: '50px' }} >{message}</h3>}
        </FormattedMessage>
        <Table
          className={styles.exchange}
          titles={titles}
          rows={myOrders}
          rowRender={(row, index) => (
            <RowFeeds
              key={index}
              row={row}
              declineRequest={declineRequest}
              acceptRequest={acceptRequest}
              removeOrder={removeOrder}
            />
          )}
        />
      </Fragment>
    )
  }
}
