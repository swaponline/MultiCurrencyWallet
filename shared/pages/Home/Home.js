import React from 'react'

import PageHeadline from 'components/PageHeadline/PageHeadline'

import Orders from './Orders/Orders'
// import SearchTrade from '../SearchTrade/SearchTrade'


const Home = () => (
  <section>
    <PageHeadline title="SWAP.ONLINE" subtitle="Instant BTC for ETH and ERC20, p2p exchange without commission" />
    {/* <SearchTrade /> */}
    <Orders />
  </section>
)

export default Home
