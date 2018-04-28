import React from 'react'

import Head from './Head/Head'
import Body from './Body/Body'

const TradesTable = () => (
    <div className="trades-table">
        <div className="container">
            <table className="table">
        
                <Head />
                <Body />

            </table>
        </div>
    </div>
)

export default TradesTable