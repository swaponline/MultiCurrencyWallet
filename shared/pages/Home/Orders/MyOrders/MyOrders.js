import React, { PureComponent, Fragment } from 'react'

import actions from 'redux/actions'

import Table from 'components/tables/Table/Table'
import styles from 'components/tables/Table/Table.scss'
import RowFeeds from './RowFeeds/RowFeeds'

import { FormattedMessage } from 'react-intl'


export default class MyOrders extends PureComponent {

  render() {
    const titles = [
      ' ',
      <FormattedMessage id="MyOrders21" defaultMessage="YOU HAVE" />,
      <FormattedMessage id="MyOrders20" defaultMessage="YOU GET" />,
      <FormattedMessage id="MyOrders22" defaultMessage="EXCHANGE RATE" />,
      ' ',
    ]
    const { myOrders, declineRequest, acceptRequest, removeOrder } = this.props

    if (myOrders.length === undefined || myOrders.length <= 0) {
      return null
    }

    return (
      <div styleName="myOrders">
        <h3 style={{ marginTop: '50px' }} >
          <FormattedMessage id="MyOrders23" defaultMessage="Your orders" />
        </h3>
        <table>
          <thead>
            <tr>
              {
                titles.map(title =>
                  <th>{title}</th>
                )
              }
            </tr>
          </thead>
          <tbody>
            {myOrders.map((order, index) => {
              return (<RowFeeds
                key={index}
                row={order}
                declineRequest={declineRequest}
                acceptRequest={acceptRequest}
                removeOrder={removeOrder}
              />)
            })}
          </tbody>
        </table>
      </div>
    )
  }
}
