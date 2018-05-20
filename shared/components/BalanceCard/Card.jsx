import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redaction'
import actions from 'redux/actions'

import user from 'instances/user'
import ethereum from 'instances/ethereum'
import bitcoin from 'instances/bitcoin'

import Header from './Header'
import Footer from './Footer'
import Address from './Address'
import Amount from './Amount'

@connect(state => ({
  wallet: state.modals.data,
}))
export default class BalanceCard extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      address: ' ',
      amount: 0,
    }

    this.setAmount = this.setAmount.bind(this)
    this.setAddress = this.setAddress.bind(this)
    this.withdraw = this.withdraw.bind(this)
  }

  withdraw(address, amount, currency) {
    switch (currency) {
      case 'ETH':
        return ethereum.send(user.ethData.address, address, amount, user.ethData.privateKey)

      case 'BTC':
        return bitcoin.send(user.btcData.address, address, amount, user.btcData.keyPair)
          .then(() => {
            actions.notification.update('withdraw', true, {})
          })

      default:
        return console.log('Не задан currency в функции withdraw')
    }
  }

  setAmount(amount) {
    this.setState({ amount })
  }

  setAddress(address) {
    this.setState({ address })
  }

  render() {
    const { open, wallet } = this.props
    const { address, amount } = this.state
    console.log('wallet', wallet)
    return (open === true ?
      <div className="modal"  tabIndex="-1" >
        <div className="modal-dialog">
          <form action="" >
            <div className="modal-content">
              <Header currency={wallet.currency} />

              <div className="modal-body">
                <div className="text-danger" />
                <Address
                  setAddress={this.setAddress}
                  currency={wallet.currency}
                />
                <Amount
                  currency={wallet.currency}
                  balance={wallet.balance}
                  setAmount={this.setAmount}
                />
              </div>

              <Footer
                withdraw={this.withdraw}
                address={address}
                amount={amount}
                currency={wallet.currency}
              />
            </div>
          </form>
        </div>
      </div> : ''
    )
  }
}

BalanceCard.propTypes = {
  open: PropTypes.bool,
  wallet: PropTypes.object,
}

