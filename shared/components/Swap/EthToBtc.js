import React, { Component, Fragment } from 'react'
import { connect } from 'redaction'
import actions from 'redux/actions'

import { EthSwap, BtcSwap } from 'swap-core/swaps'
import { ETH2BTC } from 'swap-core/flows'
import Loader from 'components/loaders/Loader/Loader'

@connect(state =>({
  btcData: state.user.btcData,
  ethData: state.user.ethData,
}))
export default class EthToBtc extends Component {

  state = {
    flow: null,
  }

  componentWillMount() {
    const { ethData, btcData } = this.props
    // TODO this might be from url query
    const { swap } = this.props

    const ethSwap = new EthSwap({
      gasLimit: 3e6,
    })

    const btcSwap = new BtcSwap({
      account: btcData.account,
      fetchUnspents: (scriptAddress) => actions.bitcoin.fetchUnspents(scriptAddress),
      broadcastTx: (txRaw) => actions.bitcoin.broadcastTx(txRaw),
    })

    const fetchBalance = () => actions.ethereum.fetchBalance(ethData.address)

    const flow = swap.setFlow(ETH2BTC, {
      ethSwap,
      btcSwap,
      fetchBalance,
    })

    this.state.flow = flow.state

    swap.flow.on('state update', this.handleFlowStateUpdate)
    swap.flow.on('leave step', this.handleLeaveStep)
    swap.flow.on('enter step', this.handleEnterStep)
  }

  componentWillUnmount() {
    const { swap } = this.props

    swap.flow.off('state update', this.handleFlowStateUpdate)
    swap.flow.off('leave step', this.handleLeaveStep)
    swap.flow.off('enter step', this.handleEnterStep)
  }

  handleFlowStateUpdate = (values) => {
    console.log('new flow state values', values)

    this.setState({
      flow: values,
    })
  }

  handleLeaveStep = (index) => {
    console.log('leave step', index)
  }

  handleEnterStep = (index) => {
    console.log('\n-----------------------------\n\n')
    console.log(`enter step ${index}\n\n`)
  }

  signSwap = () => {
    const { swap } = this.props

    swap.flow.sign()
  }

  confirmBTCScriptChecked = () => {
    const { swap } = this.props

    swap.flow.verifyBtcScript()
  }

  updateBalance = () => {
    const { swap } = this.props

    swap.flow.syncBalance()
  }

  render() {
    const { flow } = this.state
    const { swap } = this.props

    return (
      <div>
        {
          swap.id && (
            swap.isMy ? (
              <strong>{swap.sellAmount} {swap.sellCurrency} &#10230; {swap.buyAmount} {swap.buyCurrency}</strong>
            ) : (
              <strong>{swap.buyAmount} {swap.buyCurrency} &#10230; {swap.sellAmount} {swap.sellCurrency}</strong>
            )
          )
        }

        {
          !swap.id && (
            swap.isMy ? (
              <h3>This order doesn't have a buyer</h3>
            ) : (
              <Fragment>
                <h3>The order creator is offline. Waiting for him..</h3>
                <Loader overlay={false} />
              </Fragment>
            )
          )
        }

        {
          flow.isWaitingForOwner && (
            <Fragment>
              <h3>Waiting for other user when he connect to the order</h3>
              <Loader overlay={false} />
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
                        <Loader overlay={false} />
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
                  <Loader overlay={false} />
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
                      <div>Your balance: <strong>{flow.balance}</strong> {swap.sellCurrency}</div>
                      <div>Required balance: <strong>{swap.sellAmount}</strong> {swap.sellCurrency}</div>
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
                    <Loader overlay={false} />
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
                  <Loader overlay={false} />
                )
              }

              {
                (flow.step === 6 || flow.isEthWithdrawn) && (
                  <Fragment>
                    <h3>5. Waiting BTC Owner adds Secret Key to ETH Contact</h3>
                    {
                      !flow.isEthWithdrawn && (
                        <Loader overlay={false} />
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
                  <Loader overlay={false} />
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
