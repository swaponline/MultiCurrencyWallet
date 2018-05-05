import React from 'react'
import PropTypes from 'prop-types'
import './Balances.scss'

import Coin from './coin-2.svg'
import Withdraw from '../controls/Withdraw/Withdraw'

const Balances = () => (
    <tbody>
        <tr>
            <td>
                <div className="table__coins">
                    <span className="table__coin-left" className="coin-eth">
                        <img src={Coin} alt=""/>
                    </span>
                </div>
            </td>
            <td>
                <div className="table__name">ETH</div>
            </td>
            <td>
                <div className="table__balance">1.0012</div>
            </td>
            <td>
                <div className="table__key">1AC2x4fU7ui4xd7zaqLjpYvHKctLAr2b8C</div>
            </td>
            <td>
                <Withdraw text="Create account ETH" />
            </td>
        </tr>                        
    </tbody>
)

Balances.propTypes = {

};

export default Balances

