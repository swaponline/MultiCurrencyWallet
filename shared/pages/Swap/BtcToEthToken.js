import React, { Component, Fragment } from 'react'

import crypto from 'crypto'
import config from 'app-config'
import { BigNumber } from 'bignumber.js'

import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import TimerButton from 'components/controls/TimerButton/TimerButton'
import Button from 'components/controls/Button/Button'
import Timer from './Timer/Timer'


export default class BtcToEthToken extends Component {

  constructor({ swap }) {
    super()

    this.swap = swap

    this.state = {
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

  handleFlowStateUpdate = (values) => {
    this.setState({
      flow: values,
    })
  }

  submitSecret = () => {
    const { secret } = this.state

    this.swap.flow.submitSecret(secret)
  }

  updateBalance = () => {
    this.swap.flow.syncBalance()
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
    const { secret, flow, enabledButton } = this.state

    return (
      <div>
        {
          this.swap.id && (
            <strong>{this.swap.sellAmount.toNumber()} {this.swap.sellCurrency} &#10230; {this.swap.buyAmount.toNumber()} {this.swap.buyCurrency}</strong>
          )
        }
        {
          flow.isWaitingForOwner && (
            <Fragment>
              <h3>We are waiting for a market maker. If it does not appear within 5 minutes, the swap will be canceled automatically.</h3>
              <InlineLoader />
            </Fragment>
          )
        }
        {
          (flow.step === 1 || flow.isMeSigned) && (
            <Fragment>
              <h3>1. Waiting participant confirm this swap</h3>
              <InlineLoader />
            </Fragment>
          )
        }

        {/* ----------------------------------------------------------- */}

        {
          flow.isParticipantSigned && (
            <Fragment>
              <h3>2. Create a secret key</h3>

              {
                !flow.secretHash ? (
                  <Fragment>
                    <input type="text" placeholder="Secret Key" defaultValue={secret} />
                    <br />
                    <TimerButton timeLeft={5} brand onClick={this.submitSecret}>Confirm</TimerButton>
                  </Fragment>
                ) : (
                  <Fragment>
                    <div>Save the secret key! Otherwise there will be a chance you loose your money!</div>
                    <div>Secret Key: <strong>{flow.secret}</strong></div>
                    <div>Secret Hash: <strong>{flow.secretHash}</strong></div>
                  </Fragment>
                )
              }

              {
                flow.step === 3 && !flow.isBalanceEnough && !flow.isBalanceFetching && (
                  <Fragment>
                    <h3>Not enough money for this swap. Please charge the balance</h3>
                    <div>
                      <div>Your balance: <strong>{flow.balance}</strong> {this.swap.sellCurrency}</div>
                      <div>Required balance: <strong>{this.swap.sellAmount.toNumber()}</strong> {this.swap.sellCurrency}</div>
                      <div>Your address: {this.swap.flow.myBtcAddress}</div>
                      <hr />
                      <span>{flow.address}</span>
                    </div>
                    <br />
                    <TimerButton brand onClick={this.updateBalance}>Continue</TimerButton>
                  </Fragment>
                )
              }
              {
                flow.step === 3 && flow.isBalanceFetching && (
                  <Fragment>
                    <div>Checking balance..</div>
                    <InlineLoader />
                  </Fragment>
                )
              }

              {
                (flow.step === 4 || flow.btcScriptValues) && (
                  <Fragment>
                    <h3>3. Creating Bitcoin Script. Please wait, it will take a while</h3>
                    {
                      flow.btcScriptCreatingTransactionHash && (
                        <div>
                          Transaction:
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
                  </Fragment>
                )
              }
              {
                flow.btcScriptValues && !flow.isFinished && !flow.isEthWithdrawn && (
                  <Fragment>
                    <br />
                    { !flow.refundTxHex && <Button brand onClick={this.getRefundTxHex}> Create refund hex</Button> }
                    {
                      flow.refundTxHex && (
                        <div>
                          <a
                            href="https://wiki.swap.online/faq/my-swap-got-stuck-and-my-bitcoin-has-been-withdrawn-what-to-do/"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            How refund your money ?
                          </a>
                          Refund hex transaction:
                          <code>
                            {flow.refundTxHex}
                          </code>
                        </div>
                      )
                    }
                  </Fragment>
                )
              }
              {
                (flow.step === 5 || flow.isEthContractFunded) && (
                  <Fragment>
                    <h3>4. ETH Owner received Bitcoin Script and Secret Hash. Waiting when he creates ETH Contract</h3>
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
                    Transaction:
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
                  <h3>5. ETH Contract created and charged. Requesting withdrawal from ETH Contract. Please wait</h3>
                )
              }
              {
                flow.ethSwapWithdrawTransactionHash && (
                  <div>
                    Transaction:
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
                    <h3>6. Money was transferred to your wallet. Check the balance.</h3>
                    <h2>Thank you for using Swap.Online!</h2>
                  </Fragment>
                )
              }
              {
                flow.step >= 5 && !flow.isFinished && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    { enabledButton && !flow.isEthWithdrawn && <Button brand onClick={this.tryRefund}>TRY REFUND</Button> }
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
                    Transaction:
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
