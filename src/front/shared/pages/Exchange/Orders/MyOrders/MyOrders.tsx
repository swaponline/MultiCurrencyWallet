import React, { PureComponent, Fragment } from 'react'
import cssModules from 'react-css-modules'
import styles from './MyOrders.scss'
import RowFeeds from './RowFeeds/RowFeeds'

import { FormattedMessage } from 'react-intl'

@cssModules(styles, { allowMultiple: true })
export default class MyOrders extends PureComponent<any, any> {

  render() {
    const titles = [
      ' ', // empty title in the table
      <FormattedMessage id="MyOrdersYouSend" defaultMessage="You send" />,
      <FormattedMessage id="MyOrdersYouGet" defaultMessage="You get" />,
      <FormattedMessage id="MyOrdersRate" defaultMessage="Exchnage rate" />,
      ' ', // empty title in the table
    ]
    const { myOrders, declineRequest, acceptRequest, removeOrder } = this.props

    if (myOrders.length === undefined || myOrders.length <= 0) {
      return null
    }

    return (
      <div>
        <table styleName="myOrdersTable">
          <thead>
            <tr>
              {
                titles.map((title, index) =>
                  <th key={index}>{title}</th>
                )
              }
            </tr>
          </thead>
          <tbody>
            {myOrders.map((order, index) => {
              return (
                <RowFeeds
                  key={index}
                  row={order}
                  declineRequest={declineRequest}
                  acceptRequest={acceptRequest}
                  removeOrder={removeOrder}
                />
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }
}
