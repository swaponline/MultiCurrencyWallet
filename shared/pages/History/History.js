import React from 'react'

import PageHeadline from 'components/PageHeadline/PageHeadline'
import TradesTable from 'components/TradesTable/TradesTable'

const titles = ['COIN', 'STATUS', 'AMOUNT']

export default function History() {
  return (
    <section>
      <PageHeadline subtitle="History" filter />
      <TradesTable titles={titles} history />
    </section>
  )
}
