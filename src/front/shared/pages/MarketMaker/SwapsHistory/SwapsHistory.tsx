import React, { PureComponent } from 'react'

import Table from 'components/tables/Table/Table'
import styles from 'components/tables/Table/Table.scss'
import RowHistory from './RowHistory/RowHistory'
import SwapRow from './RowHistory/SwapRow'

import { FormattedMessage } from 'react-intl'
import { constants } from 'helpers'

import CSSModules from 'react-css-modules'
import stylesSwaps from './SwapsHistory.scss'


const isDark = localStorage.getItem(constants.localStorage.isDark)

@CSSModules({ ...styles, ...stylesSwaps }, { allowMultiple: true })
export default class SwapsHistory extends PureComponent<any, any> {
  constructor(props) {
    super(props)

    const {
      swapsCount,
    } = props

    this.state = {
      swapsCount,
    }
  }

  componentDidUpdate(prevProps) {
    const {
      swapsCount: prevSwapsCount,
    } = prevProps
    const {
      swapsCount,
    } = this.props
    if (prevSwapsCount !== swapsCount) {
      console.log('>>>> List updated')
      this.setState({
        swapsCount,
      })
    }
  }

  render() {
    let {
      swapsIds,
      swapsByIds,
    } = this.props
    const {
      swapsCount,
    } = this.state

    console.log('>>> Render SwapsHistory', swapsCount)
    if (swapsIds === null || swapsIds.length === 0) {
      return null
    }

    return (
      <div styleName={`swapsHistory ${isDark ? 'swapsHistoryDark' : ''}`}>
        <h3>
          <FormattedMessage id="SwapHisrory21" defaultMessage="Swaps history" />
        </h3>
        <Table
          id="table-history"
          className={styles.historySwap}
          rows={swapsIds}
          count={swapsCount}
          rowRender={(swapId, index) => (
            <SwapRow
              key={index}
              row={swapId}
              swapState={swapsByIds[swapId]}
            />
          )}
        />
      </div>
    )
  }
}
