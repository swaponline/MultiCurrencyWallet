import React, { Component, Fragment } from 'react'
import Loader from '../Loader/Loader'


export default class BtcToEth extends Component {

  constructor({ swap }) {
    super()

    this.swap = swap

    this.state = {
      flow: this.swap.flow.state,
      secret: 'c0809ce9f484fdcdfb2d5aabd609768ce0374ee97a1a5618ce4cd3f16c00a078',
      refundTxHex: null,
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

  tryRefund = () => {
    this.swap.flow.tryRefund()
  }

  getRefundTxHex = () => {
    const { refundTxHex, flow, secret } = this.state

    if (refundTxHex) {
      return refundTxHex
    }
    else if (flow.btcScriptValues) {
      this.swap.flow.btcSwap.getRefundHexTransaction({
        scriptValues: flow.btcScriptValues,
        secret,
      })
        .then((txHex) => {
          this.setState({
            refundTxHex: txHex,
          })
        })
    }
  }

  render() {
    const { secret, flow } = this.state

    const refundTxHex = this.getRefundTxHex()

    return (
      <div>
        <button onClick={this.tryRefund}>TRY REFUND</button>
        {
          flow.refundTransactionHash && (
            <div>
              Transaction:
              <strong>
                <a
                  href={`https://www.blocktrail.com/tBTC/tx/${flow.refundTransactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {flow.refundTransactionHash}
                </a>
              </strong>
            </div>
          )
        }
        <br />
        <br />

        {
          this.swap.id && (
            <strong>{this.swap.sellAmount.toNumber()} {this.swap.sellCurrency} &#10230; {this.swap.buyAmount.toNumber()} {this.swap.buyCurrency}</strong>
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
            <Fragment>
              <h3>1. Waiting participant confirm this swap</h3>
              <Loader />
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
                    <button onClick={this.submitSecret}>Confirm</button>
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
                      <hr />
                      <span>{flow.address}</span>
                    </div>
                    <br />
                    <button type="button" onClick={this.updateBalance}>Continue</button>
                  </Fragment>
                )
              }
              {
                flow.step === 3 && flow.isBalanceFetching && (
                  <Fragment>
                    <div>Checking balance..</div>
                    <Loader />
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
                              href={`https://www.blocktrail.com/tBTC/tx/${flow.btcScriptCreatingTransactionHash}`}
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
                        <Loader />
                      )
                    }
                  </Fragment>
                )
              }

              {
                refundTxHex && (
                  <div>
                    <h3>Refund hex transaction:</h3>
                    {refundTxHex}
                  </div>
                )
              }

              {
                (flow.step === 5 || flow.isEthContractFunded) && (
                  <Fragment>
                    <h3>4. ETH Owner received Bitcoin Script and Secret Hash. Waiting when he creates ETH Contract</h3>
                    {
                      !flow.isEthContractFunded && (
                        <Loader />
                      )
                    }
                  </Fragment>
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
                        href={`https://rinkeby.etherscan.io/tx/${flow.ethSwapWithdrawTransactionHash}`}
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
                  <Loader />
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
            </Fragment>
          )
        }
      </div>
    )
  }
}
