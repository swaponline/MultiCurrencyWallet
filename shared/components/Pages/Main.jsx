import React from 'react'

import Description from '../Description/Description'
import Orders from '../Orders/Orders'
// import SearchTrade from '../SearchTrade/SearchTrade'

const History = () => (
    <section>
        <Description subtitle="Instant BTC for ETH and ERC20, p2p exchange without commission" title="SWAP.ONLINE" /> 
        {/*<SearchTrade /> */}
        <Orders />
    </section>
)

export default History