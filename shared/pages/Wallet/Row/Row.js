import React, { Component, Fragment } from 'react'
import actions from 'redux/actions'
import { constants } from 'helpers'

import cssModules from 'react-css-modules'
import styles from './Row.scss'

import CopyToClipboard from 'react-copy-to-clipboard'

import Coin from 'components/Coin/Coin'
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

  // componentDidMount() {
  //   const { contractAddress, name } = this.props
  //
  //   if (name !== undefined) {
  //     actions.token.allowance(contractAddress, name)
  //   }
  // }

  handleReloadBalance = () => {
    const { isBalanceFetching, token } = this.state

    if (isBalanceFetching) {
      return null
    }

    this.setState({
      isBalanceFetching: true,
    })

    let { currency } = this.props

    currency = currency.toLowerCase()

    console.log('token', token)

    if (token) {
      actions.token.getBalance(currency)
        .then(() => {
          this.setState({
            isBalanceFetching: false,
          })
        }, () => {
          this.setState({
            isBalanceFetching: false,
          })
        })
    } else {
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

  // handleApproveToken = (decimals, contractAddress, name) => {
  //   actions.modals.open(constants.modals.Approve, {
  //     contractAddress,
  //     decimals,
  //     name,
  //   })
  // }

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

  handleGoTrade = async (link) => {
    const balance = await actions.eth.getBalance()

    if (balance > 0) {
      this.props.history.push(link)
    } else {
      actions.modals.open(constants.modals.EthChecker, {})
    }
  }

  render() {
    const { isBalanceFetching, tradeAllowed, isAddressCopied } = this.state
    const { currency, balance, isBalanceFetched, address, contractAddress, unconfirmedBalance } = this.props

    return (
      <tr>
        <td>
          <Coin name={currency} size={40} />
        </td>
        <td>{currency}</td>
        <td style={{ minWidth: '120px' }}>
          {
            !isBalanceFetched || isBalanceFetching ? (
              <InlineLoader />
            ) : (
              <Fragment>
                <i className="fas fa-sync-alt" styleName="icon" onClick={this.handleReloadBalance} />
                <span>{String(balance).length > 5 ? balance.toFixed(5) : balance}</span>
                { currency === 'BTC' && currency === 'USDT' && unconfirmedBalance !== 0 && (
                  <Fragment>
                    <br />
                    <span style={{ fontSize: '12px', color: '#c9c9c9' }}>Unconfirmed {unconfirmedBalance}</span>
                  </Fragment>
                ) }
              </Fragment>
            )
          }
        </td>
        <CopyToClipboard
          text={address}
          onCopy={this.handleCopyAddress}
        >
          <td style={{ position: 'relative' }}>
            {
              !contractAddress ? (
                <Fragment>
                  { currency !== 'EOS' && <i className="far fa-copy" styleName="icon" onClick={this.handleCopiedAddress} /> }
                  <LinkAccount type={currency} address={address} >{address}</LinkAccount>
                </Fragment>
              ) : (
                <Fragment>
                  <i className="far fa-copy" styleName="icon" onClick={this.handleCopiedAddress} />
                  <LinkAccount type={currency} contractAddress={contractAddress} address={address} >{address}</LinkAccount>
                </Fragment>
              )
            }
            {
              currency === 'EOS' && address === '' && <button styleName="button" onClick={this.handleEosLogin}>Login</button>
            }
            { isAddressCopied && <p styleName="copied" >Address copied to clipboard</p> }
          </td>
        </CopyToClipboard>
        <td >
          <div>
            <WithdrawButton onClick={this.handleWithdraw} styleName="marginRight" >
              Send
            </WithdrawButton>
            {
              tradeAllowed && (
                <Fragment>
                  <div styleName="button" onClick={() => this.handleGoTrade(`/sell-${currency.toLowerCase()}`)}>Sell</div>
                  <div styleName="button" onClick={() => this.handleGoTrade(`/buy-${currency.toLowerCase()}`)}>Buy</div>
                </Fragment>
              )
            }
          </div>
        </td>
      </tr>
    )
  }
}
