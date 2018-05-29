import React, { Component } from 'react'

import Table from 'components/Table/Table'
import Coins from 'components/Coins/Coins'

import RequestButton from './RequestButton/RequestButton'


export default class Orders extends Component {

  render() {
    const titles = [ 'EXCHANGE', 'BUY', 'SELL', 'EXCHANGE RATE', '' ]

    const rows = [
      [ { coins: [ 'btc', 'eth' ] }, '1 BTC', '520 ETH', '0.001', '' ],
      [ { coins: [ 'btc', 'eth' ] }, '1 BTC', '520 ETH', '0.001', '' ],
      [ { coins: [ 'btc', 'eth' ] }, '1 BTC', '520 ETH', '0.001', '' ],
      [ { coins: [ 'btc', 'eth' ] }, '1 BTC', '520 ETH', '0.001', '' ],
      [ { coins: [ 'btc', 'eth' ] }, '1 BTC', '520 ETH', '0.001', '' ],
      [ { coins: [ 'btc', 'eth' ] }, '1 BTC', '520 ETH', '0.001', '' ],
      [ { coins: [ 'btc', 'eth' ] }, '1 BTC', '520 ETH', '0.001', '' ],
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
          else if (colIndex === 4) {
            return (
              <RequestButton />
            )
          }

          return cell
        }}
      />
    )
  }
}
