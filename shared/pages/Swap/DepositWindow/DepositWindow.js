import React, { Fragment, Component } from 'react'

import config from 'app-config'
import { connect } from 'redaction'
import actions from 'redux/actions'
import helpers, { constants } from 'helpers'
import reducers from 'redux/core/reducers'

import CSSModules from 'react-css-modules'
import styles from '../Swap.scss'

import { BigNumber } from 'bignumber.js'

import { FormattedMessage } from 'react-intl'
import CopyToClipboard from 'react-copy-to-clipboard'
import PropTypes from 'prop-types'
import ReactTooltip from 'react-tooltip'

import Button from 'components/controls/Button/Button'
import QR from 'components/QR/QR'
import Timer from '../Timer/Timer'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'


@CSSModules(styles)
export default class DepositWindow extends Component {

  constructor({ swap, flow, onCopyAddress, currencyData }) {
    super()

    this.swap = swap

    this.state = {
      swap,
      remainingBalance: 0,
      flow: swap.flow.state,
      isBalanceEnough: false,
      isAddressCopied: false,
      isBalanceFetching: false,
      address: currencyData.address,
      scriptAddress: flow.scriptAddress,
      scriptBalance: flow.scriptBalance,
      balance: flow.balance,
      currencyFullName: currencyData.fullName,
      sellAmount: (this.swap.sellAmount.toNumber() + 0.00005),
    }
  }

  componentDidMount() {
    const { swap } =  this.props
    const { sellAmount, scriptBalance, balance } = this.state

    let checker
    this.getRequiredAmount()

    const availableBalance = swap.sellCurrency === 'BTC' ? scriptBalance : balance
    checker = setInterval(() => {
      if (availableBalance <= sellAmount) {
        this.updateBalance()
        this.checkThePayment()
      } else {
        clearInterval(checker)
      }
    }, 5000)
  }

  componentDidUpdate(prewProps, prevState) {
    if (this.state.balance !== prevState.balance) {
      this.updateRemainingBalance()
    }
  }

  updateBalance = async () => {
    const { swap } =  this.props
    const { sellAmount, scriptBalance, address, scriptAddress } =  this.state

    if (helpers.ethToken.isEthToken({ name: swap.sellCurrency.toLowerCase() })) {
      const currencyBalance = await actions.token.getBalance(swap.sellCurrency.toLowerCase())
      this.setState(() => ({ balance: Number(currencyBalance).toFixed(6) }))
    } else {
      const currencyBalance = await actions[swap.sellCurrency.toLowerCase()].getBalance()
      this.setState(() => ({ balance: Number(currencyBalance).toFixed(6) }))
    }

    const currencyBalance = swap.sellCurrency === 'BTC' ? Number(scriptBalance).toFixed(6) : (Number(this.state.balance).toFixed(6) || 0)

    this.setState(() => ({
      balance: currencyBalance,
      scriptBalance: swap.flow.state.scriptBalance,
      address: swap.sellCurrency === 'BTC' ? scriptAddress : address,
    }))
  }

  updateRemainingBalance = () => {
    const { sellAmount, balance } = this.state
    const remainingBalance = BigNumber(sellAmount).minus(balance)

    this.setState(() => ({
      remainingBalance,
    }))
  }

  getRequiredAmount = async () => {
    const { swap } =  this.props

    const coinsWithDynamicFee = [
      'eth',
      'ltc',
    ]

    if (coinsWithDynamicFee.includes(swap.sellCurrency.toLowerCase())) {
      const dynamicFee = await helpers[swap.sellCurrency.toLowerCase()].estimateFeeValue({ method: 'swap', speed: 'normal' })
      const requiredAmount = BigNumber(this.state.sellAmount).plus(dynamicFee) > 0 ?  BigNumber(this.state.sellAmount).plus(dynamicFee) : 0

      this.setState(() => ({
        sellAmount: requiredAmount,
      }))
    }
  }

  checkThePayment = () => {
    if (this.state.sellAmount <= this.state.balance) {
      this.setState(() => ({
        isBalanceEnough: true,
      }))
    }
  }

  onCopyAddress = (e) => {
    // e.preventDefault()
    this.setState({
      isPressCtrl: true,
    })
  }

  handleReloadBalance = async () => {
    const { isBalanceFetching } = this.state

    this.updateBalance()

    this.setState({
      isBalanceFetching: true,
    }, () => {
      setTimeout(() => {
        this.setState({
          isBalanceFetching: false,
        })
      }, 500)
    })
  }

  handleCopyAddress = (e) => {
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

  handlerBuyWithCreditCard = (e) => {
    e.preventDefault()
  }

  render() {
    const {
      swap,
      flow,
      balance,
      address,
      sellAmount,
      isPressCtrl,
      flowBalance,
      missingBalance,
      isAddressCopied,
      isBalanceEnough,
      currencyFullName,
      remainingBalance,
      isBalanceFetching,
    } = this.state

    const balanceToRender = Math.floor(balance * 1e6) / 1e6

    return (
      <Fragment>
        <a
          styleName="topUpLink"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div styleName="swapInfo">
            {this.swap.id &&
            (
              <strong>
                {this.swap.sellAmount.toFixed(6)}
                {' '}
                {swap.sellCurrency} &#10230; {' '}
                {this.swap.buyAmount.toFixed(6)}
                {' '}
                {swap.buyCurrency}
              </strong>
            )
            }
          </div>
          <div styleName="top">
            {/* eslint-disable */}
              <span styleName="btcMessage">
                <FormattedMessage
                  id="deposit165"
                  defaultMessage="You don't have enought funds to continue the swap. Copy the address below and top it up with the recommended amount of {missingBalance}."
                  values={{ missingBalance:
                    <div>
                      {remainingBalance > 0
                      ? <strong>{remainingBalance.toFixed(6)} {swap.sellCurrency}. </strong>
                      : <span styleName="loaderHolder">
                          <InlineLoader />
                        </span>}
                      <Tooltip id="dep170">
                        <div>
                          <FormattedMessage
                            id="deposit177"
                            defaultMessage="You don't have enought of {amount} {tokenName} to finish the swap.{br}This amount includes the missing amount on your balance and miners fee.{br}You can sent {tokenName} from any wallet and exchange."
                            values={{
                              amount: remainingBalance.toFixed(6),
                              tokenName: swap.sellCurrency,
                              br: <br />
                            }}
                          />
                          {/* <p>
                            <FormattedMessage id="deposit181" defaultMessage="You can send {currency} from a wallet of any exchange" values={{ currency: `${swap.buyCurrency}` }} />
                          </p> */}
                        </div>
                      </Tooltip>
                    </div>,
                    amount: remainingBalance.toFixed(6),
                    tokenName: swap.sellCurrency,
                    br: <br/>,
                  }}
                />
              </span>
              {/* eslint-enable */}
            <span styleName="qrImg">
              <QR
                network={currencyFullName.toLowerCase()}
                address={`${address}?amount=${remainingBalance}`}
                size={160}
              />
            </span>
          </div>
          <CopyToClipboard
            text={address}
            onCopy={this.onCopyAddress}
          >
            <div>
              <p styleName="qr">
                <a
                  styleName="linkAddress"
                  onDoubleClick={this.onCopy}
                  onClick={this.onCopyAddress}
                >
                  {address}
                </a>
                <Button
                  brand
                  disabled={isAddressCopied}
                  fullWidth
                >
                  {isAddressCopied ? <i className="fas fa-copy fa-copy-in" /> : <i className="fas fa-copy" />}
                </Button>
              </p>
            </div>
          </CopyToClipboard>
          <div>
            <i className="fas fa-sync-alt" styleName="icon" onClick={this.handleReloadBalance} />
            {/* eslint-disable */}
            {isBalanceFetching
              ? (
                <span styleName="loaderHolder">
                  <InlineLoader />
                </span>
              ) : (
                <FormattedMessage
                  id="deposit231"
                  defaultMessage="Received {balance} / {need} {tooltip}"
                  values={{
                    balance: <strong>{balanceToRender} {swap.sellCurrency}</strong>,
                    need: <strong>{sellAmount.toFixed(6)} {swap.sellCurrency}</strong>,
                    tooltip:
                      <Tooltip id="dep226">
                        <FormattedMessage
                          id="deposit239"
                          defaultMessage="If you replenish the contract for an amount greater than the specified amount, the balance will be written off as miner fee."
                        />
                      </Tooltip>
                  }}
                />
              )}
              <div>
              {isBalanceEnough
                ? <FormattedMessage id="deposit198.1" defaultMessage="create Ethereum Contract. \n Please wait, it can take a few minutes..." />
                : <FormattedMessage id="deposit198" defaultMessage="waiting for payment..." />
              }
              <span styleName="loaderHolder">
                <InlineLoader />
              </span>
            </div>
            {/* eslint-enable */}
          </div>
          {flow.btcScriptValues !== null &&
          <span styleName="lockTime">
            <i className="far fa-clock" />
            <FormattedMessage
              id="Deposit52"
              defaultMessage="You have {timer} min to make the payment"
              values={{ timer: <Timer lockTime={flow.btcScriptValues.lockTime * 1000} defaultMessage={false} /> }} />
          </span>}
        </a>
      </Fragment>
    )
  }

}
