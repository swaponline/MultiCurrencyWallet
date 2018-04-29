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
                { body ? <Body /> : '' }
                { history ? <BodyHistory /> : '' }
                { balance ? <BodyBalances /> : '' }
            </table>
        </div>
    </div>
);

export default TradesTable