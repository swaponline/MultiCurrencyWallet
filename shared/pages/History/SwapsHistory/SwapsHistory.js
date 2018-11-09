import React, { PureComponent } from 'react'

import Table from 'components/tables/Table/Table'
import styles from 'components/tables/Table/Table.scss'
import RowHistory from './RowHistory/RowHistory'
import { FormattedMessage } from 'react-intl'


export default class SwapsHistory extends PureComponent {

  render() {
    let { orders } = this.props
    const titles = [ 'Avatar', 'Exchange', 'You buy', 'You sell', 'Exchange rate', 'Status refund', 'Status order', 'Lock time', 'Link' ]

    if (orders === null || orders.length === 0) {
      return null
    }

    return (
      <div style={{ marginBottom: '50px' }}>
        <FormattedMessage id="SwapHisrory21" defaultMessage="Swaps history">
          {message => <h3>{message}</h3>}
        </FormattedMessage>
        <Table
          id="table-history"
          className={styles.historySwap}
          titles={titles}
          rows={orders.reverse()}
          rowRender={(row, index) => (
            <RowHistory
              key={index}
              row={row}
            />
          )}
        />
      </div>
    )
  }
}
