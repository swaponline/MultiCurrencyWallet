import React from 'react'

import Description from '../Description/Description'
import TradesTable from '../TradesTable/TradesTable'

const titles = ['COIN', 'STATUS', 'AMOUNT']

export default function History() {
  return (
    <section>
      <Description subtitle="History" filter />
      <TradesTable titles={titles} history />
    </section>
  )
}
