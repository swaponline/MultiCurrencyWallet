import React from 'react'

import Description from '../Description/Description'
import TradesTable from '../TradesTable/TradesTable'

const titles = ['COIN', 'STATUS', 'AMOUNT']

const History = () => (
    <section>
        <Description subtitle="History" filter={true}/>
        <TradesTable titles={titles} history={true} />
    </section>
)

export default History