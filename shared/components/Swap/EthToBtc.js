import React, { Component, Fragment } from 'react'

import { ETH2BTC } from 'swap.app/swap.flows'
import Swap from 'swap.app/swap.swap'

import Loader from 'components/loaders/Loader/Loader'


export default class EthToBtc extends Component {

  constructor({ orderId }) {
    super()

    this.swap = new Swap(orderId, ETH2BTC)

    this.state = {
      flow: this.swap.flow.state,
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

  signSwap = () => {
    this.swap.flow.sign()
  }

  confirmBTCScriptChecked = () => {
    this.swap.flow.verifyBtcScript()
  }

  updateBalance = () => {
    this.swap.flow.syncBalance()
  }

  render() {
    const { flow } = this.state

    return (
      <div>
        {
          this.swap.id && (
            this.swap.isMy ? (
              <strong>{this.swap.sellAmount} {this.swap.sellCurrency} &#10230; {this.swap.buyAmount} {this.swap.buyCurrency}</strong>
            ) : (
              <strong>{this.swap.buyAmount} {this.swap.buyCurrency} &#10230; {this.swap.sellAmount} {this.swap.sellCurrency}</strong>
            )
          )
        }

        {
          !this.swap.id && (
            this.swap.isMy ? (
              <h3>This order doesn't have a buyer</h3>
            ) : (
              <Fragment>
                <h3>The order creator is offline. Waiting for him..</h3>
                <Loader />
              </Fragment>
            )
          )
        }

        {
          flow.isWaitingForOwner && (
            <Fragment>
              <h3>Waiting for other user when he connect to the order</h3>
              <Loader />
            </Fragment>
          )
        }

        {
          (flow.step === 1 || flow.isMeSigned) && (
            <h3>1. Please confirm your participation to begin the deal</h3>
          )
        }
        {
          flow.step === 1 && (
            <Fragment>
              <div>
                Confirmation of the transaction is necessary for crediting the reputation.
                If a user does not bring the deal to the end he gets a negative reputation.
              </div>
              {
                !flow.isSignFetching && !flow.isMeSigned && (
                  <Fragment>
                    <br />
                    <button onClick={this.signSwap}>Confirm</button>
                  </Fragment>
                )
              }
              {
                (flow.isSignFetching || flow.signTransactionUrl) && (
                  <Fragment>
                    <h4>Please wait. Confirmation processing</h4>
                    {
                      flow.signTransactionUrl && (
                        <div>
                          Transaction:
                          <strong>
                            <a href={flow.signTransactionUrl} rel="noopener noreferrer" target="_blank">{flow.signTransactionUrl}</a>
                          </strong>
                        </div>
                      )
                    }
                    {
                      flow.isSignFetching && (
                        <Loader />
                      )
                    }
                  </Fragment>
                )
              }
            </Fragment>
          )
        }

        {/* -------------------------------------------------------------- */}

        {
          flow.isMeSigned && (
            <Fragment>
              <h3>2. Waiting BTC Owner creates Secret Key, creates BTC Script and charges it</h3>
              {
                flow.step === 2 && (
                  <Loader />
                )
              }

              {
                flow.secretHash && flow.btcScriptValues && (
                  <Fragment>
                    <h3>3. Bitcoin Script created and charged. Please check the information below</h3>
                    <div>Secret Hash: <strong>{flow.secretHash}</strong></div>
                    <div>
                      Script address:
                      <strong>
                        <a
                          href={`https://www.blocktrail.com/tBTC/address/${flow.btcScriptValues.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {flow.btcScriptValues.address}
                          </a>
                      </strong>
                    </div>
                    <br />
                    <pre>
                      <code className="code">{`
  bitcoinjs.script.compile([
    bitcoin.core.opcodes.OP_RIPEMD160,
    Buffer.from('${flow.btcScriptValues.secretHash}', 'hex'),
    bitcoin.core.opcodes.OP_EQUALVERIFY,

    Buffer.from('${flow.btcScriptValues.ethOwnerPublicKey}', 'hex'),
    bitcoin.core.opcodes.OP_EQUAL,
    bitcoin.core.opcodes.OP_IF,

    Buffer.from('${flow.btcScriptValues.ethOwnerPublicKey}', 'hex'),
    bitcoin.core.opcodes.OP_CHECKSIG,

    bitcoin.core.opcodes.OP_ELSE,

    bitcoin.core.script.number.encode(${flow.btcScriptValues.lockTime}),
    bitcoin.core.opcodes.OP_CHECKLOCKTIMEVERIFY,
    bitcoin.core.opcodes.OP_DROP,
    Buffer.from('${flow.btcScriptValues.btcOwnerPublicKey}', 'hex'),
    bitcoin.core.opcodes.OP_CHECKSIG,

    bitcoin.core.opcodes.OP_ENDIF,
  ])
                      `}</code>
                    </pre>
                    {
                      flow.step === 3 && (
                        <Fragment>
                          <br />
                          <button onClick={this.confirmBTCScriptChecked}>Everything is OK. Continue</button>
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
                      <div>Required balance: <strong>{this.swap.sellAmount}</strong> {this.swap.sellCurrency}</div>
                      <hr />
                      <span>{flow.address}</span>
                    </div>
                    <br />
                    <button type="button" onClick={this.updateBalance}>Continue</button>
                  </Fragment>
                )
              }
              {
                flow.step === 4 && flow.isBalanceFetching && (
                  <Fragment>
                    <div>Checking balance..</div>
                    <Loader />
                  </Fragment>
                )
              }

              {
                (flow.step === 5 || flow.isEthContractFunded) && (
                  <h3>4. Creating Ethereum Contract. Please wait, it will take a while</h3>
                )
              }
              {
                flow.ethSwapCreationTransactionUrl && (
                  <div>
                    Transaction:
                    <strong>
                      <a
                        href={flow.ethSwapCreationTransactionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {flow.ethSwapCreationTransactionUrl}
                      </a>
                    </strong>
                  </div>
                )
              }
              {
                flow.step === 5 && (
                  <Loader />
                )
              }

              {
                (flow.step === 6 || flow.isEthWithdrawn) && (
                  <Fragment>
                    <h3>5. Waiting BTC Owner adds Secret Key to ETH Contact</h3>
                    {
                      !flow.isEthWithdrawn && (
                        <Loader />
                      )
                    }
                  </Fragment>
                )
              }

              {
                (flow.step === 7 || flow.isBtcWithdrawn) && (
                  <h3>6. BTC Owner successfully took money from ETH Contract and left Secret Key. Requesting withdrawal from BTC Script. Please wait</h3>
                )
              }
              {
                flow.btcSwapWithdrawTransactionUrl && (
                  <div>
                    Transaction:
                    <strong>
                      <a
                        href="https://www.blocktrail.com/tBTC/tx/{flow.btcSwapWithdrawTransactionUrl}"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {flow.btcSwapWithdrawTransactionUrl}
                      </a>
                    </strong>
                  </div>
                )
              }
              {
                flow.step === 7 && (
                  <Loader />
                )
              }

              {
                flow.isBtcWithdrawn && (
                  <Fragment>
                    <h3>7. Money was transferred to your wallet. Check the balance.</h3>
                    <h2>Thank you for using Swap.Online!</h2>
                  </Fragment>
                )
              }
            </Fragment>
          )
        }
      </div>
    )
  }
}
