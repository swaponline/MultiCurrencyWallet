import React from 'react'

import Description from 'components/Description/Description'
import TradesTable from 'components/TradesTable/TradesTable'

const titles = ['Coin', 'Name', 'Available balance', 'Address']

export default function Balances() {
  return (
    <section>
      <Description subtitle="Balances" />
      <TradesTable titles={titles} balance />
    </section>
  )
}
