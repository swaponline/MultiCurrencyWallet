import React, { PureComponent, Fragment } from 'react'

import actions from 'redux/actions'

import { isMobile } from 'react-device-detect'

import Table from 'components/tables/Table/Table'
import styles from 'components/tables/Table/Table.scss'
import RowFeeds from './RowFeeds/RowFeeds'

import RowFeedsMobile from './RowFeedsMobile/RowFeedsMobile'
import { FormattedMessage } from 'react-intl'


export default class MyOrders extends PureComponent {

  render() {
    const titles = [
      <FormattedMessage id="MyOrders19" defaultMessage="EXCHANGE" />,
      <FormattedMessage id="MyOrders21" defaultMessage="YOU HAVE" />,
      <FormattedMessage id="MyOrders20" defaultMessage="YOU GET" />,
      <FormattedMessage id="MyOrders22" defaultMessage="EXCHANGE RATE" />,
      <FormattedMessage id="MyOrders231" defaultMessage="SHARE" />,
      <FormattedMessage id="MyOrders24" defaultMessage="ACTIONS" />,
    ]
    const { myOrders, declineRequest, acceptRequest, removeOrder } = this.props

    if (myOrders.length === undefined || myOrders.length <= 0) {
      return null
    }

    return (
      <Fragment>
        <h3 style={{ marginTop: '50px' }} >
          <FormattedMessage id="MyOrders23" defaultMessage="Your orders" />
        </h3>
        <Table
          className={styles.exchange}
          titles={titles}
          rows={myOrders}
          rowRender={(row, index) => (
            isMobile && <RowFeedsMobile
              key={index}
              row={row}
              declineRequest={declineRequest}
              acceptRequest={acceptRequest}
              removeOrder={removeOrder}
            /> || <RowFeeds
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
