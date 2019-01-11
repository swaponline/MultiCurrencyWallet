import React, { Fragment, Component } from 'react'

import config from 'app-config'
import { connect } from 'redaction'
import actions from 'redux/actions'
import { constants } from 'helpers'
import reducers from 'redux/core/reducers'

import CSSModules from 'react-css-modules'
import styles from '../Swap.scss'

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
      checking: false,
      missingBalance: 0,
      isPressCtrl: false,
      flow: swap.flow.state,
      isAddressCopied: false,
      flowBalance: flow.balance,
      address: currencyData.address,
      currency: currencyData.currency,
      scriptAddress: flow.scriptAddress,
      scriptBalance: flow.scriptBalance,
      balance: currencyData.balance || 0,
      currencyFullName: currencyData.fullName,
      unconfBalance: currencyData.unconfirmedBalance || 0,
      sellAmount: (this.swap.sellAmount.toNumber() + 0.00005),
      unconfContractBalance: flow.scriptUnconfirmedBalance || 0,
      falseBalance: currencyData.balanc || flow.scriptBalance || 0,
    }
  }

  componentDidMount() {
    const { address, scriptAddress, balance, sellAmount, currency, scriptBalance, flow, unconfBalance } = this.state

    this.deposit()

    let checker

    checker = setInterval(() => {
      if (balance <= sellAmount) {
        this.updateBalance()
      } else {
        clearInterval(checker)
      }
    }, 5000)
  }

  updateBalance = async () => {
    const { swap } =  this.props
    const { sellAmount, scriptBalance, currency, flowBalance, unconfBalance } =  this.state

    const balance = await actions[currency.toLowerCase()].getBalance(currency.toLowerCase())
    
    const falseBalance = scriptBalance ===  0 ? flowBalance || balance : scriptBalance
    const missingBalance = (sellAmount - falseBalance).toFixed(6)

    this.setState(() => ({
      balance,
      missingBalance,
      falseBalance,
      scriptBalance: swap.flow.state.scriptBalance,
    }))
    this.checker()
    this.deposit()
  }

  deposit = () => {
    const { currency, scriptAddress, address, balance, missingBalance } = this.state

    const amount = balance - 0.00015

    if (amount >= 0.00015) {
      actions[currency.toLowerCase()].send(address, scriptAddress, amount)
    }
  }

  onCopyAddress = (e) => {
    // e.preventDefault()
    this.setState({
      isPressCtrl: true,
    })
  }

checker = () => {
  if (this.state.falseBalance >= this.state.sellAmount) {
    this.setState(() => ({
      checking: true,
    }))
  }
  if (this.state.missingBalance <= 0) {
    this.setState(() => ({
      missingBalance: 0,
    }))
  }
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
      flow,
      balance,
      checking,
      sellAmount,
      isPressCtrl,
      flowBalance,
      falseBalance,
      scriptBalance,
      scriptAddress,
      missingBalance,
      isAddressCopied,
      currencyFullName,
    } = this.state

    return (
      <Fragment>
        <a
          styleName="topUpLink"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div styleName="top">
              {/* eslint-disable */}
              <span styleName="btcMessage">
                <FormattedMessage
                  id="deposit134"
                  defaultMessage="Copy this address and top up {missingBalance}"
                  values={{ missingBalance:
                    <div>
                      {missingBalance !== 0
                      ? <strong>{missingBalance} BTC. </strong>
                      : <span styleName="loaderHolder">
                          <InlineLoader />
                        </span>}
                      <Tooltip id="dep170">
                        <div>
                          <FormattedMessage
                            id="deposit146"
                            defaultMessage="You do not have enough of this amount for the exchange, the amount is specified taking into account the miner fee"
                          />
                          <p>
                            <FormattedMessage id="deposit142" defaultMessage="You can send BTC from a wallet of any exchange" />
                          </p>
                        </div>
                      </Tooltip>
                    </div>,
                  }}
                />
              </span>
              {/* eslint-enable */}
            <span styleName="qrImg">
              <QR
                network={currencyFullName.toLowerCase()}
                address={`${scriptAddress}?amount=${missingBalance}`}
                size={170}
              />
            </span>
          </div>
          <CopyToClipboard
            text={scriptAddress}
            onCopy={this.onCopyAddress}
          >
            <div>
              <p styleName="qr">
                <a
                  href={`${config.link.bitpay}/address/${scriptAddress}`}
                  styleName="linkAddress"
                  onDoubleClick={this.onCopy}
                  onClick={this.onCopyAddress}
                >
                  {scriptAddress}
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
            {/* eslint-disable */}
            <FormattedMessage
              id="deposit220"
              defaultMessage="Received {balance} / {need} {tooltip}"
              values={{
                balance: <strong>{falseBalance} BTC</strong>,
                need: <strong>{sellAmount.toFixed(6)} BTC</strong>,
                tooltip:
                  <Tooltip id="dep226">
                    <FormattedMessage
                      id="deposit1228"
                      defaultMessage="If you replenish the contract for an amount greater than the specified amount, the balance will be written off as miner fee"
                    />
                  </Tooltip>
              }}
            />
            <div>
              {checking
                ? <FormattedMessage id="deposit198.1" defaultMessage="create Ethereum Contract. Please wait, it will take a while..." />
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
              id="Deposit220"
              defaultMessage="You have {timer} min for make payment"
              values={{ timer: <Timer lockTime={flow.btcScriptValues.lockTime * 1000} defaultMessage={false} /> }} />
          </span>}
        </a>
      </Fragment>
    )
  }

}
