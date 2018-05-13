import React from 'react'

import Description from '../Description/Description'
import TradesTable from '../TradesTable/TradesTable'
import User from '../../instances/user'

const titles = ['Coin', 'Name', 'Available balance', 'Address'];

const Balances = () => (
    <section>
        <Description subtitle="Balances" />
        <div className="container">
            <a href="#" onClick={ User.getDemoMoney }> Get demo money</a><br/><br/>
        </div>
        <TradesTable titles={titles} balance={true} />
    </section>
);

export default Balances