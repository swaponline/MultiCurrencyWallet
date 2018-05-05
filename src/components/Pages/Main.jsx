import React from 'react'

import Description from '../Description/Description'
import TradesTable from '../TradesTable/TradesTable'
import SearchTrade from '../SearchTrade/SearchTrade'

const titles = ['EXCHANGE','PRICE','LIMITS','RATING']

const History = () => (
    <section>
        <Description subtitle="Instant BTC for ETH and ERC20, p2p exchange without commission" title="SWAP.ONLINE" /> 
        <SearchTrade /> 
        <TradesTable titles={titles} main={true}/>
    </section>
)

export default History