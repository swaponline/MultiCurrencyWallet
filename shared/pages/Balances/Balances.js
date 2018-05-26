import React from 'react'

import PageHeadline from 'components/PageHeadline/PageHeadline'
import TradesTable from 'components/TradesTable/TradesTable'

const titles = ['Coin', 'Name', 'Available balance', 'Address']

export default function Balances() {
  return (
    <section>
      <PageHeadline subtitle="Balances" />
      <TradesTable titles={titles} balance />
    </section>
  )
}
