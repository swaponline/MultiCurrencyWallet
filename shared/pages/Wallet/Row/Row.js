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
    showMobileButtons: false,
    countButtons: 0
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

    await actions[currency.toLowerCase()].getBalance(currency.toLowerCase())

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

  handleCountButtons = () => {
    this.setState(() => ({
      countButtons: this.state.countButtons + 1
    }))
    if (this.state.countButtons == 2) {
      this.setState(() => ({
        countButtons: 0
      }))
    }
  }

  getCurrentButton = () => {
    switch (this.state.countButtons) {
      case 0:
        return 'sendButton'
      case 1:
        return 'receiveButton' 
      case 2:
        return 'swapButton'
      default:
        return null
    }
  }

  handleEosRegister = () => {
    actions.modals.open(constants.modals.EosRegister, {})
  }

  handleTelosRegister = () => {
    actions.modals.open(constants.modals.TelosRegister, {})
  }

  handleEosBuyAccount = async () => {
    actions.modals.open(constants.modals.EosBuyAccount)
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

  handleGoTrade = (currency) => {
    this.props.history.push(`/${currency.toLowerCase()}`)
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
                currency === 'EOS' && address === '' && <button styleName="button" onClick={this.handleEosRegister}>Login</button>
              }
              {
                currency === 'EOS' && address === '' && <button styleName="button" onClick={this.handleEosBuyAccount}>Buy account</button>
              }
              {
                currency === 'TLOS' && address === '' && <button styleName="button" onClick={this.handleTelosRegister}>Login</button>
              }
              { isAddressCopied && <p styleName="copied" >Address copied to clipboard</p> }
            </td>
          </CopyToClipboard>
        ) }
        <td styleName="tdButtons">
          <div styleName={this.getCurrentButton()}>
            <button styleName="toggleWithdraw" onClick={this.handleCountButtons}>
              <i class="fas fa-ellipsis-v"></i>
            </button>
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
                  <span>Exchange</span>
                </WithdrawButton>
              )
            }
          </div>
        </td>
      </tr>
    )
  }
}
