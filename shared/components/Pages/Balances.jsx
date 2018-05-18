import React from 'react'

import Description from '../Description/Description'
import TradesTable from '../TradesTable/TradesTable'
import user from '../../instances/user'

const titles = ['Coin', 'Name', 'Available balance', 'Address']

export default function Balances() {
  return (
    <section>
      <Description subtitle="Balances" />
      <div className="container">
        <a href="#" onClick={user.getDemoMoney}> Get demo money</a><br /><br />
      </div>
      <TradesTable titles={titles} balance />
    </section>
  )
}
