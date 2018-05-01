import React from 'react'

import Description from '../components/Description/Description'
import TradesTable from '../components/TradesTable/TradesTable'

const titles = ['Coin', 'Name', 'Available balance', 'Rating']

const Balances = () => (
    <section>
        <Description subtitle="Balances" />
        <TradesTable titles={titles} balance={true} />
    </section>
)

export default Balances