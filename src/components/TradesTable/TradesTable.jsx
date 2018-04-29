import React from 'react'

import Head from './Head/Head'
import Body from './Body/Body'
import BodyHistory from './BodyHistory/BodyHistory'

const TradesTable = (props) => (
    <div className="trades-table">
        <div className="container">
            <table className="table">
                <Head titles={props.titles} />
                { props.history ? <BodyHistory /> : <Body />}
            </table>
        </div>
    </div>
)

export default TradesTable