import crypto from 'crypto'
import bitcoin from "bitcoinjs-lib"
import React, { Component, Fragment } from 'react'

import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import TransactionLink from 'components/Href/TransactionLink'

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
    const fromHexString = hexString =>
      new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))

    const hash = (secret) => {
      return bitcoin.crypto.sha256(fromHexString(secret))
    }

    const secret = crypto.randomBytes(32).toString('hex')
    const secretHash = hash(secret).toString('hex')

    this.swap.events.dispatch('submit secret', { secret, secretHash })
  }

  render() {
    const { children } = this.props
    const { secret, flow } = this.state

    if (flow.step === 1) {
      this.submitSecret()
    }

    return (
      <div>
        <Fragment>
          <h3>1. Generate secret key</h3>
          {
            flow.secret && flow.secretHash &&
            <Fragment>
              <div>Secret: <strong>{flow.secret.toString('hex')}</strong></div>
              <div>Hash: <strong>{flow.secretHash.toString('hex')}</strong></div>
            </Fragment>
          }
        </Fragment>

        {
          flow.step >= 2 &&
          <Fragment>
            <h3>2. Fund BTC script</h3>
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
            <h3>3. Request to open EOS contract</h3>
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
            <h3>4. Withdraw EOS from contract</h3>
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
            <h3>5. Request to withdraw BTC from script</h3>
            {
              flow.btcWithdrawTx === null && <InlineLoader />
            }
            {
              flow.btcWithdrawTx !== null && <TransactionLink type="BTC" id={flow.btcWithdrawTx} />
            }
          </Fragment>
        }
        <br />
        { children }
      </div>
    )
  }
}