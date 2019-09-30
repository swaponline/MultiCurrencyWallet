import crypto from 'crypto'
import * as bitcoin from 'bitcoinjs-lib'
import React, { Component, Fragment } from 'react'

import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import TransactionLink from 'components/Href/TransactionLink'
import { TimerButton, Button } from 'components/controls'

import Timer from './Timer/Timer'
import { FormattedMessage } from 'react-intl'


export default class BtcToEos extends Component {
  constructor({ swap }) {
    super()

    this.swap = swap

    this.state = {
      flow: this.swap.flow.state,
      isSubmitted: false,
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

  tryRefund = () => {
    this.swap.flow.tryRefund()
    this.setState(() => ({ enabledButton: false }))
  }

  submitSecret = () => {
    const fromHexString = hexString =>
      new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))

    const hash = (secret) => bitcoin.crypto.sha256(fromHexString(secret))

    const secret = crypto.randomBytes(32).toString('hex')
    const secretHash = hash(secret).toString('hex')

    this.swap.events.dispatch('submit secret', { secret, secretHash })

    this.setState({
      isSubmitted: true,
    })
  }

  tryRefund = () => {
    this.swap.flow.tryRefund()
  }

  render() {
    const { children, disabledTimer }  = this.props
    const { flow, isSubmitted, enabledButton } = this.state

    return (
      <div>
        <Fragment>
          <h3>
            <FormattedMessage id="BtcToEos63" defaultMessage="1. Generate secret key" />
          </h3>
          {
            !isSubmitted &&
            <TimerButton disabledTimer={disabledTimer} brand onClick={this.submitSecret}>
              <FormattedMessage id="BtcToEos67" defaultMessage="Send secret" />
            </TimerButton>
          }
          {
            flow.secret && flow.secretHash &&
            <Fragment>
              <div>
                <FormattedMessage id="BtcToEos74" defaultMessage="Secret: " />
                <strong>{flow.secret.toString('hex')}</strong>
              </div>
              <div>
                <FormattedMessage id="BtcToEos77" defaultMessage="Hash: " />
                <strong>{flow.secretHash.toString('hex')}</strong>
              </div>
            </Fragment>
          }
        </Fragment>

        {
          flow.step >= 2 &&
          <Fragment>
            <h3>
              <FormattedMessage id="BtcToEos87" defaultMessage="2. Fund BTC script" />
            </h3>
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
            <h3>
              <FormattedMessage id="BtcToEos101" defaultMessage="3. Request to open EOS contract" />
            </h3>
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
            <h3>
              <FormattedMessage id="BtcToEos115" defaultMessage="4. Withdraw EOS from contract" />
            </h3>
            {
              !flow.eosWithdrawTx && !flow.btcRefundTx && <InlineLoader />
            }
            { !flow.eosWithdrawTx && !flow.btcRefundTx &&
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {enabledButton &&
                  <Button brand onClick={this.tryRefund}>
                    <FormattedMessage id="BtcToEos126" defaultMessage="TRY REFUND" />
                  </Button>
                }
                <div>
                  <Timer lockTime={flow.scriptValues.lockTime * 1000} enabledButton={() => this.setState({ enabledButton: true })} />
                </div>
              </div>
            }
            {
              flow.eosWithdrawTx && <TransactionLink type="EOS" id={flow.eosWithdrawTx} />
            }
            {
              flow.btcRefundTx && <TransactionLink type="BTC" id={flow.btcRefundTx} />
            }
          </Fragment>
        }

        <br />
        { children }
      </div>
    )
  }
}
