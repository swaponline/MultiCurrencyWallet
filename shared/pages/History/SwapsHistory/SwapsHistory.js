import React, { Fragment, PureComponent } from 'react'

import Table from 'components/Table/Table'
import RowHistory from './RowHistory/RowHistory'


export default class SwapsHistory extends PureComponent {

  render() {
    const { orders } = this.props
    const titles = [ 'Exchange', 'You buy', 'You sell', 'Exchange rate', 'Status', 'Link' ]

    if (orders.length <= 0 || orders.length === undefined) {
      return null
    }

    return (
      <Fragment>
        <h3>Swaps history</h3>
        <Table
          titles={titles}
          rows={orders}
          rowRender={(row, index) => (
            <RowHistory
              key={index}
              row={row}
            />
          )}
        />
      </Fragment>
    )
  }
}
