import React from 'react'

import Description from '../Description/Description'
import TradesTable from '../TradesTable/TradesTable'

const titles = ['Coin', 'Name', 'Available balance', 'Address'];

const Balances = () => (
    <section>
        <Description subtitle="Balances" />
        <TradesTable titles={titles} balance={true} />
    </section>
);

export default Balances