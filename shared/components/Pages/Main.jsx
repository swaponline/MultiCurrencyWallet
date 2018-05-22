import React from 'react'

import Description from 'components/Description/Description'
import Orders from 'components/Orders/Orders'
// import SearchTrade from '../SearchTrade/SearchTrade'


export default function History() {
  return (
    <section>
      <Description subtitle="Instant BTC for ETH and ERC20, p2p exchange without commission" title="SWAP.ONLINE" />
      {/* <SearchTrade /> */}
      <Orders />
    </section>
  )
}

