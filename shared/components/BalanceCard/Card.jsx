import React from 'react'
import PropTypes from 'prop-types'

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

        this.state = {
            address: ' ',
            amount: ''
        }

        this.setAmount = this.setAmount.bind(this)
        this.setAddress = this.setAddress.bind(this)
        this.withdraw = this.withdraw.bind(this)
    }

    withdraw(address, amount, currency) {
        switch(currency) {
            case 'ETH':
                return Ethereum.send(User.ethData.address, address, amount, User.ethData.privateKey)
            
            case 'BTC':
                return Bitcoin.send(User.btcData.address, address, amount, User.btcData.keyPair)
        
            default:
                return console.log('Не задан currency в функции withdraw')
        }
    }

    setAmount(amount) {
        this.setState({ amount: amount })
    }

    setAddress(address) {
        this.setState({ address: address })
    }

    render() {
        const { open, isClose, wallet } = this.props
        const { address, amount } = this.state
        return(open === true ? 
            <div className="modal"  tabIndex="-1" >
                <div className="modal-dialog">
                    <form action="" >
                        <div className="modal-content">
                            <Header currency={wallet.currency} isClose={isClose}/>

                            <div className="modal-body">
                            <div className="text-danger" />
                            <Address 
                                setAddress={this.setAddress} 
                                currency={ wallet.currency }
                            />
                            <Amount 
                                currency={wallet.currency}
                                balance={wallet.balance}
                                setAmount={this.setAmount} 
                            />
                            </div>
                            
                            <Footer 
                                withdraw={ this.withdraw} 
                                isClose={isClose}
                                address={ address }
                                amount={ amount }
                                currency={ wallet.currency }
                            />
                        </div>
                    </form>
                </div>
            </div> : '' 
        )
    }
}

BalanceCard.propTypes = {
    open: PropTypes.bool.isRequired,
    wallet: PropTypes.object.isRequired,
    isClose: PropTypes.func.isRequired
}

export default BalanceCard