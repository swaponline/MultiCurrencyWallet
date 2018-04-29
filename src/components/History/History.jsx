import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './History.scss'

import Description from '../Description/Description'
import TradesTable from '../TradesTable/TradesTable'

const titles = ['COIN', 'STATUS', 'AMOUNT']

const History = () => (
    <section>
        <Description subtitle="History" filter={true}/>
        <TradesTable titles={titles} history={true} />
    </section>
)

export default CSSModules(History, styles)