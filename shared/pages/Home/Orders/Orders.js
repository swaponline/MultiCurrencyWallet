import React, { Component } from 'react'

import Table from 'components/Table/Table'
import Coins from 'components/Coins/Coins'


export default class Orders extends Component {

  render() {
    const titles = [ 'EXCHANGE', 'PRICE', 'LIMITS', 'EXCHANGE' ]

    const rows = [
      [ { coins: [ 'btc', 'eth' ] }, 'works...', 'works...', 'works...', 'works...' ],
    ]

    return (
      <Table
        titles={titles}
        rows={rows}
        cellRender={(cell, colIndex) => {
          if (colIndex === 0) {
            return (
              <Coins names={cell.coins} />
            )
          }

          return cell
        }}
      />
    )
  }
}
