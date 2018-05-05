import React from 'react'
import './Balances.scss'

import Ethereum from '../../instances/ethereum'

import CoinBTC from './coin-1.svg'
// import CoinETH from './coin-2.svg'
import Withdraw from '../controls/Withdraw/Withdraw'


class Balances extends React.Component {
    
    constructor(props) {
        super(props);
        this.account = Ethereum.login();

        this.onCreate = this.onCreate.bind(this)
    }


    onCreate() {
        this.props.createAccount(this.account)
    }
    
    render() {
        const { account } = this.props
        return(
            <tbody>
                <tr>
                    <td>
                        <div className="table__coins">
                            <span className="table__coin-left coin-btc">
                                <img src={CoinBTC} alt=""/>
                            </span>
                        </div>
                    </td>
                    <td>
                        <div className="table__name">Bitcoin</div>
                    </td>
                    <td>
                        <div className="table__balance">248.90037000</div>
                    </td>
                    <td>
                        <div className="table__key">{account.address}</div>
                    </td>
                    <td>
                        <Withdraw text="Withdraw"/>
                        <Withdraw onClick={ this.onCreate } text="Create account" />
                    </td>
                </tr>                        
            </tbody>
        )
    }
}

export default Balances

