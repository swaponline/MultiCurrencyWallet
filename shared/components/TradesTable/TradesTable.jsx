import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './Table.scss'

import HeadTable from '../HeadTable/HeadTable'
import HistoryContainer from '../../containers/HistoryContainer'
import BalanceContainer from '../../containers/BalanceContainer'

function TradesTable({ titles, main = false, history = false, balance = false }) {
  return (
    <div className="trades-table">
      <div styleName="container">
        <table styleName="table" >
          <HeadTable titles={titles} />
          { history ? <HistoryContainer /> : <tbody /> }
          { balance ? <BalanceContainer /> : <tbody /> }
        </table>
      </div>
    </div>
  )
}

TradesTable.propTypes = {
  titles: PropTypes.array.isRequired,
}

export default CSSModules(TradesTable, styles)
