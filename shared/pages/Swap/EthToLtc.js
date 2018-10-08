import React, { Component, Fragment } from 'react'

import actions from 'redux/actions'

import config from 'app-config'
import { BigNumber } from 'bignumber.js'

import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import TimerButton from 'components/controls/TimerButton/TimerButton'
import Button from 'components/controls/Button/Button'
import Timer from './Timer/Timer'


export default class EthToLtc extends Component {

  constructor({ swap }) {
    super()

    this.swap = swap

    this.state = {
      flow: this.swap.flow.state,
      enabledButton: false,
      isShowingLitecoinScript: false,
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
      2: 'wait-lock-ltc',
      3: 'verify-script',
      4: 'sync-balance',
      5: 'lock-eth',
      6: 'wait-withdraw-eth',
      7: 'withdraw-ltc',
      8: 'finish',
      9: 'end',
    }

    actions.analytics.swapEvent(stepNumbers[values.step], 'ETH-LTC')

    this.setState({
      flow: values,
    })
  }

  overProgress = ({ flow, length }) => {
    actions.loader.show(true, '', '', true, { flow, length, name: 'ETH2LTC' })
  }

  signSwap = () => {
    this.swap.flow.sign()
  }

  confirmLTCScriptChecked = () => {
    this.swap.flow.verifyLtcScript()
  }

  updateBalance = () => {
    this.swap.flow.syncBalance()
  }

  tryRefund = () => {
    this.swap.flow.tryRefund()
  }

  toggleLitecoinScript = () => {
    this.setState({
      isShowingLitecoinScript: !this.state.isShowingLitecoinScript,
    })
  }

  render() {
    const { children } = this.props
    const { flow, enabledButton, isShowingLitecoinScript } = this.state

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
          flow.isWaitingForOwner && (
            <Fragment>
              <h3>Waiting for other user when he connect to the order</h3>
              <InlineLoader />
            </Fragment>
          )
        }
        {
          flow.step === 1 && (
            <Fragment>
              <div>Confirmation of the transaction is necessary for crediting the reputation. If a user does not bring the deal to the end he gets a negative reputation.</div>
              <TimerButton timeLeft={5} brand onClick={this.signSwap}>Sign</TimerButton>
              {
                (flow.isSignFetching || flow.signTransactionHash) && (
                  <Fragment>
                    <h4>Please wait. Confirmation processing</h4>
                    {
                      flow.signTransactionHash && (
                        <div>
                        Transaction:
                          <strong>
                            <a
                              href={`${config.link.etherscan}/tx/${flow.signTransactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {flow.signTransactionHash}
                            </a>
                          </strong>
                        </div>
                      )
                    }
                    {
                      flow.isSignFetching && (
                        <InlineLoader />
                      )
                    }
                  </Fragment>
                )
              }
            </Fragment>
          )
        }
        {
          flow.isMeSigned && (
            <Fragment>
              <h3>2. Waiting LTC Owner creates Secret Key, creates LTC Script and charges it</h3>
              {
                flow.step === 2 && (
                  <InlineLoader />
                )
              }

              {
                flow.secretHash && flow.ltcScriptValues && (
                  <Fragment>
                    <h3>3. Litecoin Script created and charged. Please check the information below</h3>
                    <div>Secret Hash: <strong>{flow.secretHash}</strong></div>
                    <div>
                        Script address:
                      <strong>
                        {
                          flow.ltcScriptCreatingTransactionHash && (
                            <a
                              href={`${config.link.ltc}/tx/${flow.ltcScriptCreatingTransactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {flow.ltcScriptCreatingTransactionHash}
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

                    {
                      flow.step === 3 && (
                        <Fragment>
                          <br />
                          <TimerButton timeLeft={5} brand onClick={this.confirmLTCScriptChecked}>Everything is OK. Continue</TimerButton>
                        </Fragment>
                      )
                    }
                  </Fragment>
                )
              }

              {
                flow.step === 4 && !flow.isBalanceEnough && !flow.isBalanceFetching && (
                  <Fragment>
                    <h3>Not enough money for this swap. Please fund the balance</h3>
                    <div>
                      <div>Your balance: <strong>{flow.balance}</strong> {this.swap.sellCurrency}</div>
                      <div>Required balance: <strong>{this.swap.sellAmount.toNumber()}</strong> {this.swap.sellCurrency}</div>
                      <div>Your address: {this.swap.flow.myEthAddress}</div>
                      <hr />
                      <span>{flow.address}</span>
                    </div>
                    <br />
                    <Button brand onClick={this.updateBalance}>Continue</Button>
                  </Fragment>
                )
              }
              {
                flow.step === 4 && flow.isBalanceFetching && (
                  <Fragment>
                    <div>Checking balance..</div>
                    <InlineLoader />
                  </Fragment>
                )
              }

              {
                (flow.step >= 5 || flow.isEthContractFunded) && (
                  <Fragment>
                    <h3>4. Creating Ethereum Contract. Please wait, it will take a while</h3>
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
                flow.step === 5 && (
                  <InlineLoader />
                )
              }
              {
                flow.refundTransactionHash && (
                  <div>
                    Transaction:
                    <strong>
                      <a
                        href={`${config.link.etherscan}/tx/${flow.refundTransactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {flow.refundTransactionHash}
                      </a>
                    </strong>
                  </div>
                )
              }
              {
                (flow.step === 6 || flow.isEthWithdrawn) && (
                  <Fragment>
                    <h3>5. Waiting LTC Owner adds Secret Key to ETH Contact</h3>
                    {
                      !flow.isEthWithdrawn && (
                        <InlineLoader />
                      )
                    }
                  </Fragment>
                )
              }

              {
                (flow.step === 7 || flow.isLtcWithdrawn) && (
                  <h3>6. LTC Owner successfully took money from ETH Contract and left Secret Key. Requesting withdrawal from LTC Script. Please wait</h3>
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
                        rel="noopener noreferrer"
                      >
                        {flow.ltcSwapWithdrawTransactionHash}
                      </a>
                    </strong>
                  </div>
                )
              }
              {
                flow.step === 7 && (
                  <InlineLoader />
                )
              }

              {
                flow.isLtcWithdrawn && (
                  <Fragment>
                    <h3>7. Money was transferred to your wallet. Check the balance.</h3>
                    <h2>Thank you for using Swap.Online!</h2>
                  </Fragment>
                )
              }
              {
                flow.step >= 6 && !flow.isFinished && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    { enabledButton && !flow.isLtcWithdrawn && <Button brand onClick={this.tryRefund}>TRY REFUND</Button> }
                    <Timer
                      lockTime={(flow.ltcScriptValues.lockTime - 5400) * 1000}
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
                        href={`${config.link.ltc}/tx/${flow.refundTransactionHash}`}
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
        {/* { !flow.isFinished && <Button white onClick={this.addGasPrice}>Add gas price</Button> } */}
        { children }
      </div>
    )
  }
}
