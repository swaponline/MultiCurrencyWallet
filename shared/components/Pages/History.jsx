import React from 'react'

import Description from '../Description/Description'
import TradesTable from '../TradesTable/TradesTable'

const titles = ['COIN', 'STATUS', 'AMOUNT']

const History = () => (
  <section>
    <Description subtitle="History" filter />
    <TradesTable titles={titles} history />
  </section>
)

export default History
