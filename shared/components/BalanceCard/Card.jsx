import React from 'react'

import User from '../../instances/user'
import Ethereum from '../../instances/ethereum'
import Bitcoin from '../../instances/bitcoin'

import Header from './Header'
import Footer from './Footer'
import Address from './Address'
import Amount from './Amount'

class BalanceCard extends React.Component {

    constructor(props) {
        super(props)

        this.withdraw = this.withdraw.bind(this)
    }

    withdraw(address, amount) {
        // Ethereum.send(User.ethData.address, address, amount, User.ethData.privateKey)

        Bitcoin.send(User.btcData.address, 'mpbK3zmZ5UD6B8ggsc8dmkU5XGEYHBqVrr', 0.22, User.btcData.keyPair)

    }

    render() {
        const { open, isClose, wallet } = this.props
        return(open === true ? 
            <div className="modal"  tabIndex="-1" >
                <div className="modal-dialog">
                    <form action="" >
                        <div className="modal-content">
                            <Header currency={wallet.currency} isClose={isClose}/>

                            <div className="modal-body">
                                <div className="text-danger" />
                                <Address />
                                <Amount currency={wallet.currency} balance={wallet.balance}/>
                            </div>
                            
                            <Footer withdraw={ this.withdraw} isClose={isClose}/>
                        </div>
                    </form>
                </div>
            </div> : '' 
        )
    }
}
export default BalanceCard