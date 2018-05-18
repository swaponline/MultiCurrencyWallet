import React from 'react'

import Description from '../Description/Description'
import TradesTable from '../TradesTable/TradesTable'

const titles = ['Coin', 'Name', 'Available balance', 'Address']

export default function Balances() {
  return (
    <section>
      <Description subtitle="Balances" />
      <TradesTable titles={titles} balance />
    </section>
  )
}
