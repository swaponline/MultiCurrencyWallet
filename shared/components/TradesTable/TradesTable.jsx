import React from 'react'
import PropTypes from 'prop-types'

import HeadTable from '../HeadTable/HeadTable'
import HistoryContainer from '../../containers/HistoryContainer'
import BalanceContainer from '../../containers/BalanceContainer'

export default function TradesTable({ titles, main = false, history = false, balance = false }) {
  return (
    <div className="trades-table">
      <div className="container">
        <table className="table">
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

