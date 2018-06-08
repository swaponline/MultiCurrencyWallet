import React, { Component, Fragment } from 'react'
import { connect } from 'redaction'
import actions from 'redux/actions'

import { EthSwap, BtcSwap } from 'swap-core/swaps'
import { BTC2ETH } from 'swap-core/flows'
import Loader from 'components/loaders/Loader/Loader'


@connect(state => ({
  btcData: state.user.btcData,
}))
export default class BtcToEth extends Component {

  state = {
    secret: 'c0809ce9f484fdcdfb2d5aabd609768ce0374ee97a1a5618ce4cd3f16c00a078',
    flow: null,
  }

  componentWillMount() {
    const { btcData, ethData } = this.props
    // TODO this might be from url query
    const { swap } = this.props

    const ethSwap = new EthSwap({
      gasLimit: 3e6,
    })

    console.log('btcData', btcData)

    const btcSwap = new BtcSwap({
      account: btcData.account,
      address: btcData.address,
      fetchUnspents: (scriptAddress) => actions.bitcoin.fetchUnspents(scriptAddress),
      broadcastTx: (txRaw) => actions.bitcoin.broadcastTx(txRaw),
    })

    console.log('BtcSwap', btcSwap)

    const fetchBalance = () => actions.bitcoin.fetchBalance(btcData.address)

    const flow = swap.setFlow(BTC2ETH, {
      ethSwap,
      btcSwap,
      fetchBalance,
    })

    console.log('FLOOOW', flow)

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

    localStorage.setItem('swap:eth2btc', values)
  }

  handleLeaveStep = (index) => {
    console.log('leave step', index)
  }

  handleEnterStep = (index) => {
    console.log('\n-----------------------------\n\n')
    console.log(`enter step ${index}\n\n`)

    this.setState({
      flowStep: index,
    })
  }

  signSwap = () => {
    const { swap } = this.props

    swap.flow.sign()
  }

  submitSecret = () => {
    const { secret } = this.state
    const { swap } = this.props

    swap.flow.submitSecret(secret)
  }

  updateBalance = () => {
    const { swap } = this.props

    swap.flow.syncBalance()
  }

  render() {
    const { secret, flow } = this.state
    const { swap } = this.props

    console.log('BTC2ETH', swap.isMy)

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
            <Fragment>
              <h3>1. Waiting participant confirm this swap</h3>
              <Loader overlay={false} />
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
                flow.step === 3 && flow.isBalanceFetching && (
                  <Fragment>
                    <div>Checking balance..</div>
                    <Loader overlay={false} />
                  </Fragment>
                )
              }

              {
                (flow.step === 4 || flow.btcScriptValues) && (
                  <Fragment>
                    <h3>3. Creating Bitcoin Script. Please wait, it will take a while</h3>
                    {
                      !flow.btcScriptValues && (
                        <Loader overlay={false} />
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
                        <Loader overlay={false} />
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
                flow.ethSwapWithdrawTransactionUrl && (
                  <div>
                    Transaction:
                    <strong>
                      <a href={flow.ethSwapWithdrawTransactionUrl} target="_blank">{flow.ethSwapWithdrawTransactionUrl}</a>
                    </strong>
                  </div>
                )
              }
              {
                flow.step === 6 && (
                  <Loader overlay={false} />
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
