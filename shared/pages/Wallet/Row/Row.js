import React, { Component } from 'react'
import actions from 'redux/actions'
import { constants } from 'helpers'

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

  handleReloadBalance = () => {
    const { isBalanceFetching } = this.state

    if (isBalanceFetching) {
      return null
    }

    this.setState({
      isBalanceFetching: true,
    })

    let { currency, contractAddress, decimals } = this.props
    let action

    currency = currency.toLowerCase()

    if (currency === 'eth') {
      action = actions.ethereum.getBalance
      actions.analytics.dataEvent('balances-update-eth')
    }
    else if (currency === 'btc') {
      action = actions.bitcoin.getBalance
      actions.analytics.dataEvent('balances-update-btc')
    }
    else if (currency === 'eos') {
      action = actions.eos.getBalance
      actions.analytics.dataEvent('balances-update-eos')
    }
    else if (currency !== undefined) {
      console.log('currency Waller', currency)
      action = actions.token.getBalance
      actions.analytics.dataEvent('balances-update-token')
    }

    action(contractAddress, currency, decimals)
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

  render() {
    const { isBalanceFetching, viewText } = this.state
    const { currency, balance, address, contractAddress, decimals } = this.props

    return (
      <tr>
        <td>
          <Coin name={currency} size={40} />
        </td>
        <td>{currency}</td>
        <td style={{ minWidth: '80px' }}>
          {
            isBalanceFetching ? (
              <InlineLoader />
            ) : (
              balance
            )
          }
        </td>
        <td ref={td => this.textAddress = td}>
          <LinkAccount type={currency} address={address} >{address}</LinkAccount>
          { currency === 'EOS' && address === '' &&
            <button styleName="button" onClick={this.handleEosLogin}>Login with your account</button>
          }
        </td>
        <td style={{ position: 'relative' }} >
          <div>
            <button styleName="button" onClick={this.handleCopiedAddress}>Copy</button>
            <ReloadButton styleName="reloadButton" onClick={this.handleReloadBalance} />
            <WithdrawButton data={{ currency, address, contractAddress, decimals }} />
            { viewText && <p styleName="copied" >Address copied to clipboard</p> }
          </div>
        </td>
      </tr>
    )
  }
}
