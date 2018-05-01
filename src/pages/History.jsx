import React from 'react'

import Description from '../components/Description/Description'
import TradesTable from '../components/TradesTable/TradesTable'

const titles = ['COIN', 'STATUS', 'AMOUNT']

const History = () => (
    <section>
        <Description subtitle="History" filter={true}/>
        <TradesTable titles={titles} history={true} />
    </section>
)

export default History