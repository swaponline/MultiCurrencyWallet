import React from 'react'

import HeadTable from '../HeadTable/HeadTable'
import Main from '../Main/Main'
import HistoryContainer from '../../redux/containers/HistoryContainer'
import BalanceContainer from '../../redux/containers/BalanceContainer'


const TradesTable = ({ titles, main = false, history = false, balance = false }) => (
    <div className="trades-table">
        <div className="container">
            <table className="table">

                <HeadTable titles={titles} />

                { main ? <Main /> : <tbody></tbody> }

                { history ? <HistoryContainer /> : <tbody></tbody> }

                { balance ? <BalanceContainer /> : <tbody></tbody> }
                
            </table>
        </div>
    </div>
);

export default TradesTable