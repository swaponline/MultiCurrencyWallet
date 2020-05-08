import React, { Component, Fragment } from 'react'

import crypto from 'crypto'
import config from 'app-config'

import CSSModules from 'react-css-modules'
import styles from './Swap.scss'

import { BigNumber } from 'bignumber.js'

import actions from 'redux/actions'

import Timer from './Timer/Timer'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import { TimerButton, Button } from 'components/controls'
import { FormattedMessage } from 'react-intl'
import DepositWindow from './DepositWindow/DepositWindow'


export default class BchToEth extends Component {

  constructor({ swap, currencyData, enoughBalance }) {
    super()

    this.swap = swap

    this.state = {
      enoughBalance,
      enabledButton: false,
      flow: this.swap.flow.state,
      currencyAddress: currencyData.address,
      secret: crypto.randomBytes(32).toString('hex'),
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
      4: 'lock-bch',
      5: 'wait-lock-eth',
      6: 'withdraw-eth',
      7: 'finish',
      8: 'end',
    }

    actions.analytics.swapEvent(stepNumbers[values.step], 'BCH2ETH')

    this.setState({
      flow: values,
    })


    // this.overProgress(values, Object.keys(stepNumbers).length)

  }

  // overProgress = (flow, length) => {
  //   actions.loader.show(true, '', '', true, { flow, length, name: 'BCH2ETH' })
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
    else if (flow.bchScriptValues) {
      this.swap.flow.getRefundTxHex()
    }
  }


  render() {
    const { children, currencyData, swap } = this.props
    const { currencyAddress, secret, flow, enabledButton, enoughBalance } = this.state

    const headingStyle = {
      color: '#5100dc',
      textTransform: 'uppercase',
      fontSize: '20px',
      marginTop: '20px',
      borderTop: '1px solid #5100dc',
      paddingTop: '20px' }
    return (
      <div>
        <div className={this.props.styles.swapWrapper}>
          {
            this.swap.id && (
              <strong>
                {this.swap.sellAmount.toNumber()}
                {this.swap.sellCurrency} &#10230;
                {this.swap.buyAmount.toNumber()}
                {this.swap.buyCurrency}
              </strong>
            )
          }
        </div>
        <div>
          {
            !this.swap.id && (
              this.swap.isMy ? (
                <h3>
                  <FormattedMessage id="BtcToEth100" defaultMessage="This order doesn&apos;t have a buyer" />
                </h3>
              ) : (
                <Fragment>
                  <h3>
                    <FormattedMessage id="BtcToEth105" defaultMessage="The order creator is offline. Waiting for him.." />
                  </h3>
                  <InlineLoader />
                </Fragment>
              )
            )
          }
          {
            !flow.isParticipantSigned && (
              <Fragment>
                <h3>
                  <FormattedMessage
                    id="BtcToEth116"
                    defaultMessage="Waiting for a market maker. If the market maker does not appear within 5 minutes, the swap will be canceled automatically." />
                </h3>
                <InlineLoader />
              </Fragment>
            )
          }
          {flow.step > 1 && <h3 style={headingStyle}><FormattedMessage id="BtcToEthToken157" defaultMessage="1. Confirmation" /></h3>}
          {
            flow.isParticipantSigned && (
              <Fragment>
                {flow.step < 4
                  ? <h3 style={headingStyle}><FormattedMessage id="BtcToEthToken201" defaultMessage="2. Create a secret key" /></h3>
                  : <h3 style={headingStyle}><FormattedMessage id="BtcToEthToken213" defaultMessage="2. Created a secret key" /></h3> }
                {
                  !flow.secretHash && (
                    <Fragment>
                      <input type="text" placeholder="Secret Key" defaultValue={secret} />
                      <br />
                      <TimerButton timeLeft={5} brand onClick={this.submitSecret}>
                        <FormattedMessage id="BtcToEth134" defaultMessage="Confirm" />
                      </TimerButton>
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
                {window && flow.step > 4 &&
                  <h3 style={headingStyle}>
                    <FormattedMessage id="BtcToEthToken188" defaultMessage="Sent funds" />
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
                  : (flow.step === 4 || flow.bchScriptValues) && (
                    <Fragment>
                      <h3 style={headingStyle}>
                        <FormattedMessage id="BtcToEth194" defaultMessage="Creating bitcoin cash Script. Please wait, it can take a few minutes" />
                      </h3>
                      {
                        flow.bchScriptCreatingTransactionHash && (
                          <div>
                            <FormattedMessage id="BtcToEth199" defaultMessage="Transaction: " />
                            <strong>
                              <a href={`${config.link.bch}/tx/${flow.bchScriptCreatingTransactionHash}`} target="_blank" rel="noopener noreferrer">
                                {flow.bchScriptCreatingTransactionHash}
                              </a>
                            </strong>
                          </div>
                        )
                      }
                      {
                        !flow.bchScriptValues && (
                          <InlineLoader />
                        )
                      }
                    </Fragment>
                  )
                }
                {
                  flow.bchScriptValues && !flow.isFinished && !flow.isEthWithdrawn && (
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
                              href="https://wiki.swaponline.io/faq/my-swap-got-stuck-and-my-bitcoin-has-been-withdrawn-what-to-do/"
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
                        <FormattedMessage id="BtcToEth253" defaultMessage="ETH Owner received bitcoin cash Script and Secret Hash. Waiting when he creates ETH Contract" />
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
                      <FormattedMessage id="BtcToEth282" defaultMessage="ETH Contract created and charged. Requesting withdrawal from ETH Contract. Please wait" />
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
                        <FormattedMessage id="BtcToEth312" defaultMessage="ETH was transferred to your wallet. Check the balance. " />
                      </h3>
                      <h3 style={headingStyle}>
                        <FormattedMessage id="BtcToEth315" defaultMessage="Thank you for using Wallet!" />
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
                        lockTime={flow.bchScriptValues.lockTime * 1000}
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
                          href={`${config.link.bch}/tx/${flow.refundTransactionHash}`}
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
        </div>
      </div>
    )
  }
}
