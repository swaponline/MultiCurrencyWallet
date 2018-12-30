import React, { Fragment, Component } from 'react'

import config from 'app-config'
import { connect } from 'redaction'

import { FormattedMessage } from 'react-intl'
import CopyToClipboard from 'react-copy-to-clipboard'

import Button from 'components/controls/Button/Button'
import QR from 'components/QR/QR'
import Timer from '../Timer/Timer'


export default class DepositWindow extends Component {

  static getDerivedStateFromProps({ flow, currencyData }) {
    return {
      unconfBalance: currencyData.unconfirmedBalance,
      balance: flow.balance,

    }
  }

  constructor({ swap, flow, onDoubleClick, onCopyAddress, currencyData }) {
    super()

    this.swap = swap

    this.state = {
      flow: flow,
      isAddressCopied: false,
      isPressCtrl: false,
      swap: swap,
      unconfBalance: currencyData.unconfirmedBalance,
      sellAmount: this.swap.sellAmount.toNumber(),
      balance: flow.balance,
    }
  }


  updateBalance = () => {
    this.swap.flow.syncBalance()
  }

  onCopyAddress = (e) => {
    e.preventDefault()
    this.setState({
      isPressCtrl: true,
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

  render() {
    const { swap, flow, isAddressCopied, isPressCtrl, unconfBalance, sellAmount, balance } = this.state

    return (
      <Fragment>
        <a
          className={this.props.styles.topUpLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className={this.props.styles.btcMessage}>
            <FormattedMessage id="BtcToEthToken250" defaultMessage="Copy this address and top up " />
            <strong>{sellAmount} BTC</strong>
            <FormattedMessage id="BtcToEthToken251" defaultMessage=" You can send BTC from a wallet of any exchange" />
          </span>
          <CopyToClipboard
            text={flow.scriptAddress}
            onCopy={this.onCopyAddress}
          >
            <div>
              <p className={this.props.styles.qr}>
                <span
                  href={`${config.link.bitpay}/address/${flow.scriptAddress}`}
                  className={this.props.styles.linkAddress}
                  onDoubleClick={this.onCopy}
                  onClick={this.onCopyAddress}>{flow.scriptAddress}
                </span>
                <Button
                  styleName="button"
                  brand
                  onClick={() => {}}
                  disabled={isAddressCopied}
                  fullWidth
                >
                  { isAddressCopied ? <i className="fas fa-copy fa-copy-in" /> : <i className="fas fa-copy" /> }
                </Button>
              </p>
              <b className={this.state.isPressCtrl ? this.props.styles.pressCtrlTextActive : this.props.styles.pressCtrlText}>
                <FormattedMessage id="BtcToEthToken251" defaultMessage="Press CTRL + C or ⌘ + C to copy the bitcoin address." />
              </b>
            </div>
          </CopyToClipboard>
          <div className={this.props.styles.infoWrapper}>
            <div className={this.props.styles.fromClient}>
              <FormattedMessage id="BtcToEthToken168" defaultMessage="Required balance: " />
              {sellAmount.toFixed(5)} BTC
            </div>
            <div className={this.props.styles.yourBalance}>
              <FormattedMessage id="BtcToEthToken169" defaultMessage="Current balance:" />
              {balance.toFixed(5)} BTC
            </div>
            <div className={this.props.styles.unconfBalance}>
              <FormattedMessage id="BtcToEthToken170" defaultMessage="Unconfirmed balance: {unconfBalance} BTC" values={{ unconfBalance: unconfBalance.toFixed(4) }}/>
            </div>
            <Button brand onClick={this.updateBalance}>
              <FormattedMessage id="BtcToEthToken171" defaultMessage="Check payment " />
            </Button>
            <span className={this.props.styles.qrImg}>
              <QR
                network={flow.scriptAddress}
                address={flow.scriptAddress}
                size={170}
              />
            </span>
          </div>
          <span className={this.props.styles.lockTime}>
            <i className="far fa-clock" />
            <FormattedMessage id="BtcToEthToken336" defaultMessage="You have " />
            <span>
              <Timer
                lockTime={flow.btcScriptValues.lockTime * 1000}
                defaultMessage={false}
              />
            </span>
            <FormattedMessage id="BtcToEthToken342" defaultMessage="min for make payment" />
          </span>
        </a>
        </Fragment>
    )
  }

}
