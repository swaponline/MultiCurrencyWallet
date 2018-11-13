import React, { Component, Fragment } from 'react'

import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import TransactionLink from 'components/Href/TransactionLink'

import { Button } from 'components/controls'
import Timer from './Timer/Timer'
import { FormattedMessage } from 'react-intl'


export default class EosToBtc extends Component {
  constructor({ swap }) {
    super()

    this.swap = swap

    this.state = {
      flow: this.swap.flow.state,
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

  verifyScript = () => {
    const { flow: { scriptValues: { secretHash, recipientPublicKey, ownerPublicKey, lockTime } } } = this.state

    if (secretHash && recipientPublicKey && ownerPublicKey && lockTime) {
      this.swap.events.dispatch('verify script')
    }
  }

  tryRefund = () => {
    this.swap.flow.tryRefund()
  }

  render() {
    const { children } = this.props
    const { flow, enabledButton } = this.state

    if (flow.step === 2) {
      setTimeout(this.verifyScript, 2000)
    }

    return (
      <div>
        <Fragment>
          <FormattedMessage id="EosToBtc59" defaultMessage="1. Request to fund BTC script">
            {message => <h3>{message}</h3>}
          </FormattedMessage>
          {
            flow.createTx === null && <InlineLoader />
          }
          {
            flow.createTx !== null && <TransactionLink type="BTC" id={flow.createTx} />
          }
        </Fragment>

        {
          flow.step >= 2 &&
          <Fragment>
            <FormattedMessage id="EosToBtc73" defaultMessage="2. Verify BTC script">
              {message => <h3>{message}</h3>}
            </FormattedMessage>
          </Fragment>
        }

        {
          flow.step >= 3 &&
          <Fragment>
            <FormattedMessage id="EosToBtc82" defaultMessage="3. Open EOS contract">
              {message => <h3>{message}</h3>}
            </FormattedMessage>
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
            <FormattedMessage id="EosToBtc97" defaultMessage="4. Request to withdraw EOS from contract">
              {message => <h3>{message}</h3>}
            </FormattedMessage>
            {
              flow.eosWithdrawTx === null && <InlineLoader />
            }
            {
              !flow.btcWithdrawTx && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  { enabledButton && !flow.eosWithdrawTx &&
                    <Button brand onClick={this.tryRefund}>
                      <FormattedMessage id="EosToBtc107" defaultMessage="TRY REFUND" />
                    </Button>
                  }
                  <Timer
                    lockTime={flow.scriptValues.lockTime * 1000}
                    enabledButton={() => this.setState({ enabledButton: true })}
                  />
                </div>
              )
            }
            {
              flow.eosWithdrawTx !== null && <TransactionLink type="EOS" id={flow.eosWithdrawTx} />
            }
          </Fragment>
        }

        {
          flow.step >= 5 &&
          <Fragment>
            <FormattedMessage id="EosToBtc127" defaultMessage="5. Withdraw BTC from script">
              {message => <h3>{message}</h3>}
            </FormattedMessage>
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
