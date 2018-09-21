import React, { PureComponent } from 'react'

import Table from 'components/tables/Table/Table'
import styles from 'components/tables/Table/Table.scss'
import RowHistory from './RowHistory/RowHistory'


export default class SwapsHistory extends PureComponent {

  render() {
    let { orders } = this.props
    const titles = [ 'Avatar', 'Exchange', 'You buy', 'You sell', 'Exchange rate', 'Status refund', 'Status order', 'Lock time', 'Link' ]

    if (orders === null || orders.length === 0) {
      return null
    }

    return (
      <div style={{ marginBottom: '50px' }}>
        <h3>Swaps history</h3>
        <Table
          classTitle={styles.historySwap}
          titles={titles}
          rows={orders}
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
