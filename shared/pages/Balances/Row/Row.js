import React, { Component } from 'react'
import actions from 'redux/actions'
import config from 'app-config'

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

    let { currency } = this.props

    currency = currency.toLowerCase()

    if (currency === 'eth') {
      actions.ethereum.getBalance()
        .then(() => {
          this.setState({
            isBalanceFetching: false,
          })
        })
      actions.analytics.dataEvent('balances-update-eth')
    }
    else if (currency === 'btc') {
      actions.bitcoin.getBalance()
        .then(() => {
          this.setState({
            isBalanceFetching: false,
          })
        })
      actions.analytics.dataEvent('balances-update-btc')
    }
    else if (currency === 'noxon') {
      actions.token.getBalance(config.services.tokens.noxon, currency)
        .then(() => {
          this.setState({
            isBalanceFetching: false,
          })
        })
      actions.analytics.dataEvent('balances-update-noxon')
    }
    else if (currency === 'swap') {
      actions.token.getBalance(config.services.tokens.swap, currency)
      actions.analytics.dataEvent('balances-update-swap')
    }
    else if (currency === 'eos') {
      actions.eos.getBalance()
        .then(() => {
          this.setState({
            isBalanceFetching: false,
          })
        })
      actions.analytics.dataEvent('balances-update-eos')
    }
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

  render() {
    const { isBalanceFetching, viewText } = this.state
    const { currency, balance, address } = this.props

    return (
      <tr>
        <td>
          <Coin name={currency} size={40} />
        </td>
        <td>{currency.toUpperCase()}</td>
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
        </td>
        <td style={{ position: 'relative' }} >
          <button styleName="button" onClick={this.handleCopiedAddress} >Copy</button>
          <ReloadButton styleName="reloadButton" onClick={this.handleReloadBalance} />
          <WithdrawButton data={{ currency, balance, address }} />
          { viewText && <p styleName="copied" >Address copied to clipboard</p> }
        </td>
      </tr>
    )
  }
}
