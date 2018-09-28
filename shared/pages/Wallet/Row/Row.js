import React, { Component, Fragment } from 'react'
import actions from 'redux/actions'
import { constants } from 'helpers'
import config from 'app-config'
import { isMobile } from 'react-device-detect'

import cssModules from 'react-css-modules'
import styles from './Row.scss'

import CopyToClipboard from 'react-copy-to-clipboard'

import CoinInteractive from 'components/CoinInteractive/CoinInteractive'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import WithdrawButton from 'components/controls/WithdrawButton/WithdrawButton'

import LinkAccount from '../LinkAccount/LinkAcount'
import { withRouter } from 'react-router'


@withRouter
@cssModules(styles)
export default class Row extends Component {

  state = {
    isBalanceFetching: false,
    viewText: false,
    tradeAllowed: false,
    isAddressCopied: false,
  }

  componentWillMount() {
    const { currency, currencies } = this.props

    this.setState({
      tradeAllowed: !!currencies.find(c => c.value === currency.toLowerCase()),
    })
  }

  componentDidMount() {
    const { hiddenCoinsList } = this.props

    Object.keys(config.erc20)
      .forEach(name => {
        if (!hiddenCoinsList.includes(name.toUpperCase())) {
          actions.core.markCoinAsVisible(name.toUpperCase())
        }
      })
  }

  handleReloadBalance = async () => {
    const { isBalanceFetching } = this.state

    if (isBalanceFetching) {
      return null
    }

    this.setState({
      isBalanceFetching: true,
    })

    const { currency } = this.props

    await actions[currency.toLowerCase()].getBalance()

    this.setState(() => ({
      isBalanceFetching: false,
    }))
  }

  handleCopyAddress = () => {
    this.setState({
      isAddressCopied: true,
    }, () => {
      setTimeout(() => {
        this.setState({
          isAddressCopied: false,
        })
      }, 500)
    })
  }

  handleEosLogin = () => {
    actions.modals.open(constants.modals.Eos, {})
  }

  handleEosCreateAccount = async () => {
    try {
      await actions.eos.createAccount()
    } catch (error) {
      console.log(error.toString())
      actions.notifications.show(constants.notifications.Message, { message: error.toString() })
    }
  }

  handleWithdraw = () => {
    const { currency, address, contractAddress, decimals, balance, token } = this.props

    actions.analytics.dataEvent(`balances-withdraw-${currency.toLowerCase()}`)
    actions.modals.open(constants.modals.Withdraw, {
      currency,
      address,
      contractAddress,
      decimals,
      token,
      balance,
    })
  }

  handleReceive = () => {
    const { currency, address } = this.props

    actions.modals.open(constants.modals.ReceiveModal, {
      currency,
      address,
    })
  }

  handleGoTrade = async (currency) => {
    const balance = await actions.eth.getBalance()

    if (balance >= 0.005 || currency.toLowerCase() === 'eos') {
      this.props.history.push(`/${currency.toLowerCase()}`)
    } else {
      actions.modals.open(constants.modals.EthChecker, {})
    }
  }

  handleMarkCoinAsHidden = (coin) => {
    actions.core.markCoinAsHidden(coin)
  }

  render() {
    const { isBalanceFetching, tradeAllowed, isAddressCopied } = this.state
    const { currency, balance, isBalanceFetched, address, contractAddress, unconfirmedBalance } = this.props

    return (
      <tr>
        <td>
          <CoinInteractive name={currency} />
        </td>
        <td>{currency}</td>
        <td styleName="table_balance-cell">
          {
            !isBalanceFetched || isBalanceFetching ? (
              <InlineLoader />
            ) : (
              <div styleName="no-select-inline" onClick={this.handleReloadBalance} >
                <i className="fas fa-sync-alt" styleName="icon" />
                <span>{String(balance).length > 4 ? balance.toFixed(4) : balance}</span>
                { currency === 'BTC' && unconfirmedBalance !== 0 && (
                  <Fragment>
                    <br />
                    <span style={{ fontSize: '12px', color: '#c9c9c9' }}>Unconfirmed {unconfirmedBalance}</span>
                  </Fragment>
                ) }
                { currency === 'USDT' && unconfirmedBalance !== 0 && (
                  <Fragment>
                    <br />
                    <span style={{ fontSize: '12px', color: '#c9c9c9' }}>Unconfirmed {unconfirmedBalance}</span>
                  </Fragment>
                ) }
              </div>
            )
          }
        </td>

        { !isMobile && (
          <CopyToClipboard
            text={address}
            onCopy={this.handleCopyAddress}
          >
            <td style={{ position: 'relative' }}>
              {
                !contractAddress ? (
                  <Fragment>
                    {
                      address !== '' && <i className="far fa-copy" styleName="icon" />
                    }
                    <LinkAccount type={currency} address={address} >{address}</LinkAccount>
                  </Fragment>
                ) : (
                  <Fragment>
                    <i className="far fa-copy" styleName="icon" />
                    <LinkAccount type={currency} contractAddress={contractAddress} address={address} >{address}</LinkAccount>
                  </Fragment>
                )
              }
              {
                currency === 'EOS' && address === '' && <button styleName="button" onClick={this.handleEosLogin}>Login</button>
              }
              {
                currency === 'EOS' && address === '' && <button styleName="button" onClick={this.handleEosCreateAccount}>Register</button>
              }
              { isAddressCopied && <p styleName="copied" >Address copied to clipboard</p> }
            </td>
          </CopyToClipboard>
        ) }
        <td>
          <div>
            <WithdrawButton onClick={this.handleWithdraw} styleName="marginRight">
              <i className="fas fa-arrow-alt-circle-up" />
              <span>Send</span>
            </WithdrawButton>
            { isMobile && (
              <WithdrawButton onClick={this.handleReceive} styleName="marginRight">
                <i className="fas fa-arrow-alt-circle-down" />
                <span>Receive</span>
              </WithdrawButton>
            )}
            {
              tradeAllowed && (
                <WithdrawButton onClick={() => this.handleGoTrade(currency)}>
                  <i className="fas fa-exchange-alt" />
                  <span>Swap</span>
                </WithdrawButton>
              )
            }
          </div>
        </td>
      </tr>
    )
  }
}
