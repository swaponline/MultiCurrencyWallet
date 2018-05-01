import React from 'react'

import Description from '../components/Description/Description'
import TradesTable from '../components/TradesTable/TradesTable'
import SearchTrade from '../components/SearchTrade/SearchTrade'

const titles = ['EXCHANGE','PRICE','LIMITS','RATING']

const History = () => (
    <section>
        <Description subtitle="Instant BTC for ETH and ERC20, p2p exchange without commission" title="SWAP.ONLINE" /> 
        <SearchTrade /> 
        <TradesTable titles={titles} body={true}/>
    </section>
)

export default History