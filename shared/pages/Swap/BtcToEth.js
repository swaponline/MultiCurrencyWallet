import React, { Component, Fragment } from 'react'

import crypto from 'crypto'
import config from 'app-config'

// import CSSModules from 'react-css-modules'
// import styles from './Swap.scss'

import { BigNumber } from 'bignumber.js'

import actions from 'redux/actions'

import Timer from './Timer/Timer'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import SwapProgress from 'components/SwapProgress/SwapProgress'
import { TimerButton, Button } from 'components/controls'
import { FormattedMessage } from 'react-intl'


export default class BtcToEth extends Component {

  constructor({ swap, currencyData }) {
    super()

    this.swap = swap

    this.state = {
      currencyAddress: currencyData.address,
      flow: this.swap.flow.state,
      secret: crypto.randomBytes(32).toString('hex'),
      enabledButton: false,
    }
  }

  componentWillMount() {
    this.swap.on('state update', this.handleFlowStateUpdate)
  }

  componentWillUnmount() {
    this.swap.off('state update', this.handleFlowStateUpdate)
  }

  tryRefund = () => {
    this.swap.flow.tryRefund()
  }

  handleFlowStateUpdate = (values) => {

    const stepNumbers = {
      1: 'sign',
      2: 'submit-secret',
      3: 'sync-balance',
      4: 'lock-btc',
      5: 'wait-lock-eth',
      6: 'withdraw-eth',
      7: 'finish',
      8: 'end',
    }

    actions.analytics.swapEvent(stepNumbers[values.step], 'BTC2ETH')

    this.setState({
      flow: values,
    })


    // this.overProgress(values, Object.keys(stepNumbers).length)

  }

  // overProgress = (flow, length) => {
  //   actions.loader.show(true, '', '', true, { flow, length, name: 'BTC2ETH' })
  // }

  submitSecret = () => {
    const { secret } = this.state

    this.swap.flow.submitSecret(secret)
  }

  updateBalance = () => {
    this.swap.flow.syncBalance()
  }

  tryRefund = () => {
    this.swap.flow.tryRefund()
    this.setState(() => ({ enabledButton: false }))
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


  render() {
    const { children } = this.props
    const { currencyAddress, secret, flow, enabledButton } = this.state
    const headingStyle = {
      color: '#5100dc',
      textTransform: 'uppercase',
      fontSize: '20px',
      marginTop: '20px',
      borderTop: '1px solid #5100dc',
      paddingTop: '20px' }
    return (
      <div>
        <div style={{ width: '500px', margin: 'auto' }}>
          {
            this.swap.id && (
              <strong>{this.swap.sellAmount.toNumber()} {this.swap.sellCurrency} &#10230; {this.swap.buyAmount.toNumber()} {this.swap.buyCurrency}</strong>
            )
          }
          <SwapProgress data={flow} name="BTC2ETH" stepLength={8} />
        </div>
        {
          !this.swap.id && (
            this.swap.isMy ? (
              <h3>
                <FormattedMessage id="BtcToEth100" defaultMessage="1. This order doesn&apos;t have a buyer" />
              </h3>
            ) : (
              <Fragment>
                <h3>
                  <FormattedMessage id="BtcToEth105" defaultMessage="1. The order creator is offline. Waiting for him.." />
                </h3>
                <InlineLoader />
              </Fragment>
            )
          )
        }
        {
          !flow.isParticipantSigned && (
            <Fragment>
              <h3 style={headingStyle}>
                <FormattedMessage
                  id="BtcToEth116"
                  defaultMessage="1. We are waiting for a market maker. If it does not appear within 5 minutes, the swap will be canceled automatically." />
              </h3>
              <InlineLoader />
            </Fragment>
          )
        }
        {
          flow.isParticipantSigned && (
            <Fragment>
              <h3 style={headingStyle}>
                <FormattedMessage id="BtcToEth126" defaultMessage="2. Create a secret key" />
              </h3>
              {
                !flow.secretHash ? (
                  <Fragment>
                    <input type="text" placeholder="Secret Key" defaultValue={secret} />
                    <br />
                    <TimerButton timeLeft={5} brand onClick={this.submitSecret}>
                      <FormattedMessage id="BtcToEth134" defaultMessage="Confirm" />
                    </TimerButton>
                  </Fragment>
                ) : (
                  <Fragment>
                    <div>
                      <FormattedMessage id="BtcToEth140" defaultMessage="Save the secret key! Otherwise there will be a chance you loose your money!" />
                    </div>
                    <div>
                      <FormattedMessage id="BtcToEth143" defaultMessage="Secret Key: " />
                      <strong>{flow.secret}</strong>
                    </div>
                    <div>
                      <FormattedMessage id="BtcToEth146" defaultMessage="Secret Hash: " />
                      <strong style={{ display: 'block' }}>{flow.secretHash}</strong>
                    </div>
                  </Fragment>
                )
              }

              {
                flow.step === 3 && !flow.isBalanceEnough && !flow.isBalanceFetching && (
                  <Fragment>
                    <h3 style={headingStyle}>
                      <FormattedMessage id="BtcToEth156" defaultMessage="Not enough money for this swap. Please charge the balance" />
                    </h3>
                    <div>
                      <div>
                        <FormattedMessage id="BtcToEth160" defaultMessage="Your balance: " />
                        <strong>{flow.balance}</strong> {this.swap.sellCurrency}
                      </div>
                      <div>
                        <FormattedMessage id="BtcToEth163" defaultMessage="Required balance: " />
                        <strong>{this.swap.sellAmount.toNumber()}</strong> {this.swap.sellCurrency}
                      </div>
                      <div>
                        <div>
                          <FormattedMessage id="BtcToEth167" defaultMessage="Your address: " />
                          <a href={`${config.link.bitpay}/address/${currencyAddress}`} target="_blank" el="noopener noreferrer">
                            {currencyAddress}
                          </a>
                        </div>
                        <hr />
                        <span>{flow.address}</span>
                      </div>
                      <br />
                      <Button brand onClick={this.updateBalance}>
                        <FormattedMessage id="174" defaultMessage="Continue" />
                      </Button>
                    </div>
                  </Fragment>
                )
              }
              {
                flow.step === 3 && flow.isBalanceFetching && (
                  <Fragment>
                    <div style={headingStyle}>
                      <FormattedMessage id="BtcToEth183" defaultMessage="Checking balance.." />
                    </div>
                    <InlineLoader />
                  </Fragment>
                )
              }

              {
                (flow.step === 4 || flow.btcScriptValues) && (
                  <Fragment>
                    <h3 style={headingStyle}>
                      <FormattedMessage id="BtcToEth194" defaultMessage="4. Creating Bitcoin Script. Please wait, it will take a while" />
                    </h3>
                    {
                      flow.btcScriptCreatingTransactionHash && (
                        <div>
                          <FormattedMessage id="BtcToEth199" defaultMessage="Transaction: " />
                          <strong>
                            <a href={`${config.link.bitpay}/tx/${flow.btcScriptCreatingTransactionHash}`} target="_blank" el="noopener noreferrer">
                              {flow.btcScriptCreatingTransactionHash}
                            </a>
                          </strong>
                        )
                        </div>
                      )
                    }
                    {
                      !flow.btcScriptValues && (
                        <InlineLoader />
                      )
                    }
                  </Fragment>
                )
              }
              {
                flow.btcScriptValues && !flow.isFinished && !flow.isEthWithdrawn && (
                  <Fragment>
                    <br />
                    { !flow.refundTxHex &&
                      <Button brand onClick={this.getRefundTxHex}>
                        <FormattedMessage id="BtcToEth226" defaultMessage="Create refund hex" />
                      </Button>
                    }
                    {
                      flow.refundTxHex && (
                        <div>
                          <a
                            href="https://wiki.swap.online/faq/my-swap-got-stuck-and-my-bitcoin-has-been-withdrawn-what-to-do/"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FormattedMessage id="BtcToEth233" defaultMessage="How refund your money ?" />
                          </a>
                          <FormattedMessage id="BtcToEth248" defaultMessage="Refund hex transaction: " />
                          <code> {flow.refundTxHex} </code>
                        </div>
                      )
                    }
                  </Fragment>
                )
              }
              {
                (flow.step === 5 || flow.isEthContractFunded) && (
                  <Fragment>
                    <h3 style={headingStyle}>
                      <FormattedMessage id="BtcToEth253" defaultMessage="5. ETH Owner received Bitcoin Script and Secret Hash. Waiting when he creates ETH Contract" />
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
                  <div>
                    <FormattedMessage id="BtcToEth266" defaultMessage="Transaction: " />
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
                  <h3 style={headingStyle}>
                    <FormattedMessage id="BtcToEth282" defaultMessage="6. ETH Contract created and charged. Requesting withdrawal from ETH Contract. Please wait" />
                  </h3>
                )
              }
              {
                flow.ethSwapWithdrawTransactionHash && (
                  <div>
                    <FormattedMessage id="BtcToEth289" defaultMessage="Transaction: " />
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
                flow.isEthWithdrawn && (
                  <Fragment>
                    <h3 style={headingStyle}>
                      <FormattedMessage id="BtcToEth312" defaultMessage="7. Money was transferred to your wallet. Check the balance. " />
                    </h3>
                    <h3 style={headingStyle}>
                      <FormattedMessage id="BtcToEth315" defaultMessage="Thank you for using Swap.Online!" />
                    </h3>
                  </Fragment>
                )
              }
              {
                flow.step >= 5 && !flow.isFinished && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    { enabledButton && !flow.isEthWithdrawn &&
                      <Button brand onClick={this.tryRefund}>
                        <FormattedMessage id="BtcToEth325" defaultMessage="TRY REFUND" />
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
                flow.refundTransactionHash && (
                  <div>
                    <FormattedMessage id="BtcToEth338" defaultMessage="Transaction: " />
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
        { children }
      </div>
    )
  }
}
