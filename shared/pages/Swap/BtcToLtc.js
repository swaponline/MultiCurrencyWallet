import React, { Component, Fragment } from 'react'

import crypto from 'crypto'
import config from 'app-config'
import { BigNumber } from 'bignumber.js'

import actions from 'redux/actions'

import Timer from './Timer/Timer'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import { TimerButton, Button } from 'components/controls'


export default class BtcToLtc extends Component {

  constructor({ swap }) {
    super()

    this.swap = swap

    this.state = {
      flow: this.swap.flow.state,
      secret: crypto.randomBytes(32).toString('hex'),
      enabledButton: false,
      isShowingBitcoinScript: false,
    }
  }

  componentWillMount() {
    this.swap.on('state update', this.handleFlowStateUpdate)
  }

  componentWillUnmount() {
    this.swap.off('state update', this.handleFlowStateUpdate)
  }

  handleFlowStateUpdate = (values) => {
    const stepNumbers = {
      1: 'sign',
      2: 'submit-secret',
      3: 'sync-balance',
      4: 'lock-btc',
      5: 'wait-lock-ltc',
      6: 'withdraw-ltc',
      7: 'finish',
      8: 'end',
    }

    actions.analytics.swapEvent(stepNumbers[values.step], 'BTC2LTC')

    this.setState({
      flow: values,
    })
  }

  overProgress = ({ flow, length }) => {
    actions.loader.show(true, '', '', true, { flow, length, name: 'BTC2LTC' })
  }

  submitSecret = () => {
    const { secret } = this.state

    this.swap.flow.submitSecret(secret)
  }

  updateBalance = () => {
    this.swap.flow.syncBalance()
  }

  tryRefund = () => {
    this.swap.flow.tryRefund()
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

  toggleLitecoinScript = () => {
    this.setState({
      isShowingLitecoinScript: !this.state.isShowingLitecoinScript,
    })
  }

  render() {
    const { children } = this.props
    const { secret, flow, enabledButton, isShowingLitecoinScript } = this.state

    return (
      <div>
        {
          this.swap.id && (
            <strong>{this.swap.sellAmount.toNumber()} {this.swap.sellCurrency} &#10230; {this.swap.buyAmount.toNumber()} {this.swap.buyCurrency}</strong>
          )
        }
        {
          !this.swap.id && (
            this.swap.isMy ? (
              <h3>This order doesn&apos;t have a buyer</h3>
            ) : (
              <Fragment>
                <h3>The order creator is offline. Waiting for him..</h3>
                <InlineLoader />
              </Fragment>
            )
          )
        }
        {
          !flow.isParticipantSigned && (
            <Fragment>
              <h3>We are waiting for a market maker. If it does not appear within 5 minutes, the swap will be canceled automatically.</h3>
              <InlineLoader />
            </Fragment>
          )
        }
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
                    <Button brand onClick={this.updateBalance}>Continue</Button>
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
                flow.btcScriptValues && !flow.isFinished && !flow.isLtcWithdrawn && (
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
                (flow.step === 5 || flow.isLtcScriptFunded) && (
                  <Fragment>
                    <h3>4. LTC Owner received Bitcoin Script and Secret Hash. Waiting when he creates LTC Script</h3>
                    {
                      !flow.isLtcScriptFunded && (
                        <InlineLoader />
                      )
                    }
                  </Fragment>
                )
              }
              {
                (flow.step === 6 || flow.isLtcWithdrawn) && (
                  <Fragment>
                    <h3>5. Litecoin Script created and charged. Please check the information below</h3>
                    <div>Secret Hash: <strong>{flow.secretHash}</strong></div>
                    <div>
                        Script address:
                      <strong>
                        {
                          flow.ltcSwapCreationTransactionHash && (
                            <a
                              href={`${config.link.ltc}/tx/${flow.ltcSwapCreationTransactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {flow.ltcSwapCreationTransactionHash}
                            </a>
                          )
                        }
                      </strong>
                    </div>
                    <br />
                    <Fragment>
                      { flow.ltcScriptValues && <span onClick={this.toggleLitecoinScript}>Show litecoin script</span> }
                      { isShowingLitecoinScript && (
                        <pre>
                          <code>{`
  bitcoinjs.script.compile([
    bitcoin.core.opcodes.OP_RIPEMD160,
    Buffer.from('${flow.ltcScriptValues.secretHash}', 'hex'),
    bitcoin.core.opcodes.OP_EQUALVERIFY,

    Buffer.from('${flow.ltcScriptValues.recipientPublicKey}', 'hex'),
    bitcoin.core.opcodes.OP_EQUAL,
    bitcoin.core.opcodes.OP_IF,

    Buffer.from('${flow.ltcScriptValues.recipientPublicKey}', 'hex'),
    bitcoin.core.opcodes.OP_CHECKSIG,

    bitcoin.core.opcodes.OP_ELSE,

    bitcoin.core.script.number.encode(${flow.ltcScriptValues.lockTime}),
    bitcoin.core.opcodes.OP_CHECKLOCKTIMEVERIFY,
    bitcoin.core.opcodes.OP_DROP,
    Buffer.from('${flow.ltcScriptValues.ownerPublicKey}', 'hex'),
    bitcoin.core.opcodes.OP_CHECKSIG,

    bitcoin.core.opcodes.OP_ENDIF,
  ])
                      `}
                          </code>
                        </pre>
                      )
                      }
                    </Fragment>

                    <br />
                    <br />

                  </Fragment>
                )
              }
              {
                flow.ltcSwapWithdrawTransactionHash && (
                  <div>
                    Transaction:
                    <strong>
                      <a
                        href={`${config.link.ltc}/tx/${flow.ltcSwapWithdrawTransactionHash}`}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        {flow.ltcSwapWithdrawTransactionHash}
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
                flow.isLtcWithdrawn && (
                  <Fragment>
                    <h3>6. Money was transferred to your wallet. Check the balance.</h3>
                    <h2>Thank you for using Swap.Online!</h2>
                  </Fragment>
                )
              }
              {
                flow.step >= 5 && !flow.isFinished && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    { enabledButton && !flow.isLtcWithdrawn && <Button brand onClick={this.tryRefund}>TRY REFUND</Button> }
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
