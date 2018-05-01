import React from 'react'

import HeadTable from '../HeadTable/HeadTable'
import Body from './Body/Body'
import BodyHistory from './BodyHistory/BodyHistory'
import BodyBalances from './BodyBalances/BodyBalances'


const TradesTable = ({ titles, body = false, history = false, balance = false }) => (
    <div className="trades-table">
        <div className="container">
            <table className="table">

                <HeadTable titles={titles} />

                { body ? <Body /> : <tbody></tbody> }

                { history ? <BodyHistory /> : <tbody></tbody> }

                { balance ? <BodyBalances /> : <tbody></tbody> }
                
            </table>
        </div>
    </div>
);

export default TradesTable