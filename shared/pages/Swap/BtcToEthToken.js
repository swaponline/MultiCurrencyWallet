import React, { Component, Fragment } from 'react'

import actions from 'redux/actions'
import { constants } from 'helpers'
import { isMobile } from 'react-device-detect'

import crypto from 'crypto'
import config from 'app-config'
import { BigNumber } from 'bignumber.js'
import Swap from 'swap.swap'

import CopyToClipboard from 'react-copy-to-clipboard'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import TimerButton from 'components/controls/TimerButton/TimerButton'
import Link from 'sw-valuelink'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'
import DepositWindow from './DepositWindow/DepositWindow'
import SwapProgress from 'components/SwapProgress/SwapProgress'
import SwapList from './SwapList/SwapList'
import QR from 'components/QR/QR'
import swapApp from 'swap.app'
import Timer from './Timer/Timer'
import { FormattedMessage } from 'react-intl'


export default class BtcToEthToken extends Component {

  static getDerivedStateFromProps({ continueSwap, enoughBalance }) {
    return {
      continuerSwap: continueSwap,
      enoughBalance,
    }
  }

  constructor({ swap, currencyData, ethData, continueSwap, enoughBalance, styles, window }) {
    super()

    this.swap = swap

    this.state = {
      window,
      currencyAddress: currencyData.address,
      flow: this.swap.flow.state,
      secret: crypto.randomBytes(32).toString('hex'),
      enabledButton: false,
      isAddressCopied: false,
      isPressCtrl: false,
      paddingContainerValue: 0,
      destinationAddressTimer: true,
      destinationBuyAddress: (this.swap.destinationBuyAddress) ? this.swap.destinationBuyAddress : swapApp.services.auth.accounts.eth.address,
      isTextCopied: false,
      ethAddress: ethData.map(item => item.address),
      continuerSwap: continueSwap,
      enoughBalance,
    }
  }

  componentDidMount() {
    this.swap.on('state update', this.handleFlowStateUpdate)
    this.handleCheckPaddingValue()
  }

  componentWillUnmount() {
    this.swap.off('state update', this.handleFlowStateUpdate)
  }

  handleFlowStateUpdate = (values) => {

    this.setState({
      flow: values,
    })

    this.handleCheckPaddingValue()

  }

  tryRefund = () => {
    this.swap.flow.tryRefund()
    this.setState(() => ({ enabledButton: false }))
  }

  submitSecret = () => {
    const { secret } = this.state
    this.swap.flow.submitSecret(secret)
  }

  confirmAddress = () => {
    this.swap.setDestinationBuyAddress(this.state.destinationBuyAddress)
    this.setState({ destinationAddressTimer : false })
  }

  destinationAddressFocus = () => {
    this.setState({
      destinationAddressTimer: false,
    })
  }

  updateBalance = () => {
    this.swap.flow.syncBalance()
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

  getRefundTxHex = () => {
    const { flow } = this.state

    if (flow.refundTxHex) {
      return flow.refundTxHex
    }
    else if (flow.btcScriptValues) {
      this.swap.flow.getRefundTxHex()
    }
  }

  handleCopyText = () => {
    this.setState({
      isTextCopied: true,
    }, () => {
      setTimeout(() => {
        this.setState({
          isTextCopied: false,
        })
      }, 15 * 1000)
    })
  }

  onRequeryWithdraw = () => {
    this.swap.flow.sendWithdrawRequest()
  }

  onCopyAddress = (e) => {
    e.preventDefault()
    this.setState({
      isPressCtrl: true,
    })
  }

  handleCheckPaddingValue = () => {

    const { flow, paddingContainerValue, enoughBalance } = this.state

    const value = 60
    const padding = value * flow.step
    const padding4 = value * (flow.step - 1)

    if (flow.step === 1) {
      this.setState(() => ({
        paddingContainerValue: padding,
      }))
    }
    if (flow.step === 2) {
      this.setState(() => ({
        paddingContainerValue: 120,
      }))
    }
    if (!enoughBalance && flow.step === 4) {
      this.setState(() => ({
        paddingContainerValue: 120,
      }))
    }
    if (flow.step === 5) {
      this.setState(() => ({
        paddingContainerValue: 180,
      }))
    }
    if (flow.step === 6) {
      this.setState(() => ({
        paddingContainerValue: 240,
      }))
    }
    if (flow.step === 7) {
      this.setState(() => ({
        paddingContainerValue: 300,
      }))
    }
  }

  handlerBuyWithCreditCard = (e) => {
    e.preventDefault()
  }

  render() {
    const { children, disabledTimer, swap, currencyData } = this.props
    const { currencyAddress, secret, flow, enabledButton,
      destinationAddressTimer, continuerSwap, isTextCopied, ethAddress, enoughBalance, window, paddingContainerValue } = this.state

    const linked = Link.all(this, 'destinationBuyAddress')


    const headingStyle = {
      color: '#5100dc',
      textTransform: 'uppercase',
      fontSize: '20px',
      marginTop: '20px',
      borderTop: '1px solid #5100dc',
      paddingTop: '20px' }

    linked.destinationBuyAddress.check((value) => value !== '', 'Please enter ETH address for tokens')
    return (
      <div className={this.props.styles.swapContainer} style={{ paddingTop: isMobile ? `${paddingContainerValue}px` : '' }}>
        {(!enoughBalance && flow.step === 4) ?
          (
            <div className={this.props.styles.swapDepositWindow}>
              <DepositWindow currencyData={currencyData} swap={swap} flow={swap.flow.state} />
            </div>) :
          (
            <SwapProgress data={flow} name="BTC2ETH" stepLength={8} />
          )
        }
        <SwapList data={flow} />


        <div className={this.props.styles.swapInfo}>
          {
            this.swap.id && (
              <strong>
                {this.swap.sellAmount.toFixed(6)}
                {' '}
                {this.swap.sellCurrency} &#10230;
                {this.swap.buyAmount.toFixed(6)}
                {' '}
                {this.swap.buyCurrency}
              </strong>
            )
          }
        </div>
        <div className={this.props.styles.logHide}>
          {
            flow.isWaitingForOwner && (
              <Fragment>
                <h3>
                  <FormattedMessage
                    id="BtcToEthToken77"
                    defaultMessage="Waiting for a market maker. If the market maker does not appear within 5 minutes, the swap will be canceled automatically." />
                </h3>
                <InlineLoader />
              </Fragment>
            )
          }

          {
            (!flow.isWaitingForOwner && !this.swap.destinationBuyAddress) && (
              <Fragment>
                <h3 style={headingStyle}>
                  <FormattedMessage id="BtcToEthTokenAddress1" defaultMessage="Confirm destination address (by default - swap.online wallet)" />
                </h3>
                <Input valueLink={linked.destinationBuyAddress} onFocus={this.destinationAddressFocus} styleName="input" pattern="0-9a-zA-Z" />
                { destinationAddressTimer && (
                  <TimerButton disabledTimer={disabledTimer} timeLeft={5} brand onClick={this.confirmAddress}>
                    <FormattedMessage id="BtcToEthTokenAddress2" defaultMessage="Confirm address " />
                  </TimerButton>
                ) }
                { !destinationAddressTimer && (
                  <Button brand onClick={this.confirmAddress} styleName="button">
                    <FormattedMessage id="BtcToEthTokenAddress2" defaultMessage="Confirm address" />
                  </Button>
                ) }
              </Fragment>
            )
          }

          {
            (this.swap.destinationBuyAddress && (flow.step === 1 || flow.isMeSigned)) && (
              <Fragment>
                <h3><FormattedMessage id="BtcToEthToken87" defaultMessage="Waiting participant confirm this swap" /></h3>
                <InlineLoader />
              </Fragment>
            )
          }

          {/* ----------------------------------------------------------- */}
          {flow.step > 1 && <h3 style={headingStyle}><FormattedMessage id="BtcToEthToken157" defaultMessage="1. Confirmation" /></h3>}
          {
            flow.isParticipantSigned && this.swap.destinationBuyAddress && (
              <Fragment>
                {flow.step < 4
                  ? <h3 style={headingStyle}><FormattedMessage id="BtcToEthToken201" defaultMessage="2. Create a secret key" /></h3>
                  : <h3 style={headingStyle}><FormattedMessage id="BtcToEthToken213" defaultMessage="2. Created a secret key" /></h3> }
                {
                  !flow.secretHash && (
                    <Fragment>
                      <input type="text" placeholder="Secret Key" defaultValue={secret} />
                      <br />
                      <TimerButton disabledTimer={disabledTimer} timeLeft={5} brand onClick={this.submitSecret}>
                        <FormattedMessage id="BtcToEthToken108" defaultMessage="Confirm" />
                      </TimerButton>
                    </Fragment>
                  )
                }
                {
                  flow.step === 3 && flow.isBalanceFetching && (
                    <Fragment>
                      <h3 style={headingStyle}>
                        <FormattedMessage id="BtcToEthToken156" defaultMessage="3. Checking balance.." />
                      </h3>
                      <InlineLoader />
                    </Fragment>
                  )
                }
                {window && flow.step > 4 &&
                  <h3 style={headingStyle}>
                    <FormattedMessage id="BtcToEthToken1245" defaultMessage="Sent funds" />
                  </h3>
                }
                {(!enoughBalance && flow.step === 4)
                  ? (
                    <div className="swapStep-4">
                      <h3 style={headingStyle}>
                        <FormattedMessage id="BtcToEthToken256" defaultMessage="Send your funds" />
                      </h3>
                      <DepositWindow currencyData={currencyData} swap={swap} flow={swap.flow.state} />
                    </div>
                  )
                  : (flow.step === 4 && flow.btcScriptValues && (
                    <div className="swapStep-4">
                      <h3 h3 style={headingStyle}>
                        <FormattedMessage id="BtcToEthToken222" defaultMessage="Creating Bitcoin Script. \n Please wait, it can take a few minutes" />
                      </h3>
                      {
                        flow.btcScriptCreatingTransactionHash && (
                          <div styleName="transaction">
                            <FormattedMessage id="BtcToEthToken172" defaultMessage="Transaction: " />
                            <strong>
                              <a
                                href={`${config.link.bitpay}/tx/${flow.btcScriptCreatingTransactionHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {flow.btcScriptCreatingTransactionHash}
                              </a>
                            </strong>
                          </div>
                        )
                      }
                      {
                        !flow.btcScriptValues && (
                          <InlineLoader />
                        )
                      }
                    </div>
                  )
                  )
                }

                {
                  (flow.step === 5 || flow.isEthContractFunded) && (
                    <Fragment>
                      <h3 style={headingStyle}>
                        <FormattedMessage id="BtcToEthToken230" defaultMessage="ETH Owner received Bitcoin Script and Secret Hash. Waiting when he creates ETH Contract" />
                      </h3>
                      {
                        !flow.isEthContractFunded && (
                          <InlineLoader />
                        )
                      }
                    </Fragment>
                  )
                }
                {
                  flow.ethSwapCreationTransactionHash && (
                    <div styleName="transaction">
                      <FormattedMessage id="BtcToEthToken243" defaultMessage="Transaction: " />
                      <strong>
                        <a
                          href={`${config.link.etherscan}/tx/${flow.ethSwapCreationTransactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {flow.ethSwapCreationTransactionHash}
                        </a>
                      </strong>
                    </div>
                  )
                }
                
                {
                  (flow.step === 6 || flow.isEthWithdrawn) && (
                    <Fragment>
                      <h3 style={headingStyle}>
                        <FormattedMessage id="BtcToEthToken260" defaultMessage="4. ETH Contract created and charged. Requesting withdrawal from ETH Contract. Please wait" />
                      </h3>
                      {/* {!continuerSwap &&
                        <h3 style={{ color: '#E72BB3', marginTop: '10px' }}>
                          <FormattedMessage
                            id="BtcToEthTokenAddress348"
                            defaultMessage="Not enough ETH on your balance for miner fee.{br}{br}Deposit 0.001 ETH to your account {address}"
                            values={{ address: `${ethAddress}`, br: <br /> }}
                          />
                        </h3>
                      } */}
                    </Fragment>
                  )
                }
                {
                  flow.ethSwapWithdrawTransactionHash && (
                    <div styleName="transaction">
                      <FormattedMessage id="BtcToEthToken267" defaultMessage="Transaction: " />
                      <strong>
                        <a
                          href={`${config.link.etherscan}/tx/${flow.ethSwapWithdrawTransactionHash}`}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          {flow.ethSwapWithdrawTransactionHash}
                        </a>
                      </strong>
                    </div>
                  )
                }
                {
                  flow.step === 6 && (
                    <InlineLoader />
                  )
                }
                {
                  (flow.step === 6 && flow.requireWithdrawFee && !flow.requireWithdrawFeeSended) && (
                    <Fragment>
                      <h3 style={headingStyle}>Not enough ETH on your balance for miner fee</h3>
                      <div>Deposit {BigNumber(flow.withdrawFee).dividedBy(1e8).toFixed(8)} ETH or</div>
                      <Button brand onClick={this.onRequeryWithdraw}>Requery other side for withdraw</Button>
                    </Fragment>
                  )
                }
                {
                  (flow.step === 6 && flow.requireWithdrawFeeSended) && (
                    <h3 style={headingStyle}>Withdraw request sended</h3>
                  )
                }
                {
                  (flow.isEthWithdrawn) && (
                    <Fragment>
                      <h3 h3 style={headingStyle}>
                        <FormattedMessage id="BtcToEthToken290" defaultMessage="ETH was transferred to your wallet. Check the balance." />
                      </h3>
                      <h2 style={headingStyle}>
                        <FormattedMessage id="BtcToEthToken293" defaultMessage="Thank you for using Swap.Online!" />
                      </h2>
                    </Fragment>
                  )
                }
                {
                  flow.step >= 5 && !flow.isFinished && (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      { enabledButton && !flow.isEthWithdrawn &&
                        <Button brand onClick={this.tryRefund}>
                          <FormattedMessage id="BtcToEthToken303" defaultMessage="TRY REFUND" />
                        </Button>
                      }
                      <Timer
                        lockTime={flow.btcScriptValues.lockTime * 1000}
                        enabledButton={() => this.setState({ enabledButton: true })}
                      />
                    </div>
                  )
                }
                {
                  flow.refundTransactionHash && continuerSwap && (
                    <div styleName="transaction">
                      <FormattedMessage id="BtcToEthToken316" defaultMessage="Transaction: " />
                      <strong>
                        <a
                          href={`${config.link.bitpay}/tx/${flow.refundTransactionHash}`}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          {flow.refundTransactionHash}
                        </a>
                      </strong>
                    </div>
                  )
                }
              </Fragment>
            )
          }

          <br />
          {/* { !flow.isFinished && <Button green onClick={this.addGasPrice}>Add gas price</Button> } */}
        </div>
        <div className={this.props.styles.information}>
          { children }
        </div>
      </div>
    )
  }
}
