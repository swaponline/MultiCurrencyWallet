import React from 'react'
import PropTypes from 'prop-types'

import Description from '../Description/Description'
import TradesTable from '../TradesTable/TradesTable'

const titles = ['Coin', 'Name', 'Available balance', 'Rating']

const Balances = () => (
    <section >
        <Description subtitle="Balances" />
        <TradesTable titles={titles} balance={true} />
    </section>
)

Balances.propTypes = {

};

export default Balances

