import crypto from 'bitcoinjs-lib/src/crypto'
import React, { Component, Fragment } from 'react'

import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'

export default class BtcToEos extends Component {
  constructor({ swap }) {
    super()

    this.swap = swap

    this.state = {
      flow: this.swap.flow.state
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
      flow: values
    })
  }

  submitSecret = () => {
    const userGeneratedRandomValue = Number.parseInt(Math.random()*1000).toString()

    const secretBuffer = crypto.ripemd160(Buffer.from(userGeneratedRandomValue, 'hex'))
    const secretHashBuffer = crypto.ripemd160(secretBuffer)

    const secret = secretBuffer.toString('hex')
    const secretHash = secretHashBuffer.toString('hex')

    this.swap.events.dispatch('submit secret', { secret, secretHash })
  }

  render() {
    const { secret, flow } = this.state

    if (flow.step === 1) {
      this.submitSecret()
    }

    return (
      <div>
        <Fragment>
          <h3>1. Generating secret...</h3>
          {
            flow.secret && flow.secretHash &&
              <Fragment>
                <div>Secret: <strong>{flow.secret}</strong></div>
                <div>Hash: <strong>{flow.secretHash}</strong></div>
              </Fragment>
          }
        </Fragment>

        {
          flow.step >= 2 &&
          <Fragment>
            <h3>2. Creating script...</h3>
            {
              flow.createTx === null && <InlineLoader />
            }
            {
              flow.createTx !== null && <TransactionLink type="BTC" id={flow.createTx} />
            }
          </Fragment>
        }

        {
          flow.step >= 3 &&
            <Fragment>
              <h3>3. Waiting for open swap...</h3>
              {
                flow.openTx === null && <InlineLoader />
              }
              {
                flow.openTx !== null && <TransactionLink type="EOS" id={flow.openTx} />
              }
            </Fragment>
        }

        {
          flow.step >= 4 &&
            <Fragment>
              <h3>4. Withdrawing EOS from contract...</h3>
              {
                flow.eosWithdrawTx === null && <InlineLoader />
              }
              {
                flow.eosWithdrawTx !== null && <TransactionLink type="EOS" id={flow.eosWithdrawTx} />
              }
            </Fragment>
        }

        {
          flow.step >= 5 &&
            <Fragment>
              <h3>5. Watching for BTC withdrawal...</h3>
              {
                flow.btcWithdrawTx === null && <InlineLoader />
              }
              {
                flow.btcWithdrawTx !== null && <TransactionLink type="BTC" id={flow.btcWithdrawTx} />
              }
            </Fragment>
        }
      </div>
    )
  }
}