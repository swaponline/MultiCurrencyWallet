import React, { Component, Fragment } from 'react'
import actions from 'redux/actions'
import { constants, web3 } from 'helpers'

import cssModules from 'react-css-modules'
import styles from './Row.scss'

import Coin from 'components/Coin/Coin'
import WithdrawButton from 'components/controls/WithdrawButton/WithdrawButton'
import ReloadButton from 'components/controls/ReloadButton/ReloadButton'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'

import LinkAccount from '../LinkAccount/LinkAcount'


@cssModules(styles)
export default class Row extends Component {

  state = {
    isBalanceFetching: false,
    viewText: false,
  }

  componentDidMount() {
    const { contractAddress, name, balance } = this.props

    if (name !== undefined) {
      actions.token.allowance(contractAddress, name)
    }
  }

  handleReloadBalance = () => {
    const { isBalanceFetching } = this.state

    if (isBalanceFetching) {
      return null
    }

    this.setState({
      isBalanceFetching: true,
    })

<<<<<<< HEAD
    let { currency } = this.props
=======


    let { currency, contractAddress, decimals } = this.props
    let action
>>>>>>> 31bd7b68db245fd3f34097867ce6a2ab0b1f9b77

    currency = currency.toLowerCase()

    actions[currency].getBalance(currency)
      .then(() => {
        this.setState({
          isBalanceFetching: false,
        })
      }, () => {
        this.setState({
          isBalanceFetching: false,
        })
      })
  }

  handleCopiedAddress = () => {
    this.setState({ viewText: true })
    const el = document.createElement('textarea')
    el.value = this.textAddress.innerText
    el.style.position = 'absolute'
    el.style.left = '-9999px'
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    setTimeout(() => {
      this.setState({ viewText: false })
    }, 800)
  }

  handleEosLogin = () => {
    actions.modals.open(constants.modals.Eos, {})
  }

  handleApproveToken = (decimals, contractAddress, name) => {
    actions.modals.open(constants.modals.Approve, {
      contractAddress,
      decimals,
      name,
    })
  }

  handleWithdraw = () => {
    const { currency, address, contractAddress, decimals, balance } = this.props

    actions.analytics.dataEvent(`balances-withdraw-${currency.toLowerCase()}`)
    actions.modals.open(constants.modals.Withdraw, {
      currency,
      address,
      contractAddress,
      decimals,
      balance,
    })
  }

  render() {
    const { isBalanceFetching, viewText } = this.state
    const { currency, name, balance, isBalanceFetched, address, contractAddress, decimals, approve, unconfirmedBalance } = this.props
  
    return (
      <tr>
        <td>
          <Coin name={currency} size={40} />
        </td>
        <td>{currency}</td>
        <td style={{ minWidth: '80px' }}>
          {
            !isBalanceFetched || isBalanceFetching ? (
              <InlineLoader />
            ) : (
              <Fragment>
                <span>{balance.toFixed(8)}</span> <br />
                { currency === 'BTC' && unconfirmedBalance !== 0 && <span style={{ fontSize: '12px', color: '#c9c9c9' }}>Unconfirmed {unconfirmedBalance}</span> }
              </Fragment>
            )
          }
        </td>
        <td ref={td => this.textAddress = td}>
          {
            !contractAddress ? (
              <LinkAccount type={currency} address={address} >{address}</LinkAccount>
            ) : (
              !approve ? (
                <button styleName="button" onClick={() => this.handleApproveToken(decimals, contractAddress, name)}>Approve</button>
              ) : (
                <LinkAccount type={currency} contractAddress={contractAddress} address={address} >{address}</LinkAccount>
              )
            )
          }
          {
            currency === 'EOS' && address === '' && <button styleName="button" onClick={this.handleEosLogin}>Login</button>
          }
        </td>
        <td style={{ position: 'relative' }} >
          <div>
            <button styleName="button" onClick={this.handleCopiedAddress}>Copy</button>
            <ReloadButton styleName="reloadButton" onClick={this.handleReloadBalance} />
            <WithdrawButton onClick={this.handleWithdraw} >
              Withdraw
            </WithdrawButton>
            { viewText && <p styleName="copied" >Address copied to clipboard</p> }
          </div>
        </td>
      </tr>
    )
  }
}
