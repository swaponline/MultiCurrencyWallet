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

  tryRefund = () => {
    this.swap.flow.tryRefund()
    this.setState(() => ({ enabledButton: false }))
  }

  render() {
    const { children, disabledTimer }  = this.props
    const { flow, enabledButton } = this.state

    return (
      <div>
        <Fragment>
          <h3>
            <FormattedMessage id="EosToBtc59" defaultMessage="1. Request to fund BTC script" />
          </h3>
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
            <h3>
              <FormattedMessage id="EosToBtc73" defaultMessage="2. Verify BTC script" />
            </h3>
          </Fragment>
        }

        {
          flow.step >= 3 &&
          <Fragment>
            <h3>
              <FormattedMessage id="EosToBtc82" defaultMessage="3. Open EOS contract" />
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
              <FormattedMessage id="EosToBtc97" defaultMessage="4. Request to withdraw EOS from contract" />
            </h3>
            {
              !flow.eosWithdrawTx && !flow.eosRefundTx && <InlineLoader />
            }
            {
              !flow.eosWithdrawTx && !flow.eosRefundTx &&
              (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  { enabledButton &&
                    <Button brand onClick={this.tryRefund}>
                      <FormattedMessage id="EosToBtc107" defaultMessage="TRY REFUND" />
                    </Button>
                  }
                  <Timer
                    lockTime={flow.scriptValues.lockTime / 2 * 1000}
                    enabledButton={() => this.setState({ enabledButton: true })}
                  />
                </div>
              )
            }
            {
              flow.eosWithdrawTx !== null && <TransactionLink type="EOS" id={flow.eosWithdrawTx} />
            }
            {
              flow.eosRefundTx !== null && <TransactionLink type="EOS" id={flow.eosRefundTx} />
            }
          </Fragment>
        }

        {
          flow.step >= 5 &&
          <Fragment>
            <h3>
              <FormattedMessage id="EosToBtc127" defaultMessage="5. Withdraw BTC from script" />
            </h3>
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
