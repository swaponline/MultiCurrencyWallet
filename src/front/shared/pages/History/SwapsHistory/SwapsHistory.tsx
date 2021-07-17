import React, { PureComponent } from 'react'

import Table from 'components/tables/Table/Table'
import styles from 'components/tables/Table/Table.scss'
import RowHistory from './RowHistory/RowHistory'

import { FormattedMessage } from 'react-intl'

import CSSModules from 'react-css-modules'
import stylesSwaps from './SwapsHistory.scss'

@CSSModules({ ...styles, ...stylesSwaps }, { allowMultiple: true })
export default class SwapsHistory extends PureComponent<any, any> {

  render() {
    let { orders } = this.props

    if (orders === null || orders.length === 0) {
      return null
    }

    return (
      <div styleName="swapsHistory">
        <h3>
          <FormattedMessage id="SwapHisrory21" defaultMessage="Swaps history" />
        </h3>
        <Table
          id="table-history"
          className={styles.historySwap}
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
