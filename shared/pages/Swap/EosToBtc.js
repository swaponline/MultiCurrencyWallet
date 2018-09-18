import React, { Component, Fragment } from 'react'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import TransactionLink from 'components/Href/TransactionLink'


export default class EosToBtc extends Component {
  constructor({ swap }) {
    super()

    this.swap = swap

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

  verifyScript = () => {
    this.swap.events.dispatch('verify script')
  }

  render() {
    const { children } = this.props
    const { flow } = this.state

    if (flow.step === 2) {
      this.verifyScript()
    }

    return (
      <div>
        <Fragment>
          <h3>1. Request to fund BTC script</h3>
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
            <h3>2. Verify BTC script</h3>
          </Fragment>
        }

        {
          flow.step >= 3 &&
          <Fragment>
            <h3>3. Open EOS contract</h3>
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
            <h3>4. Request to withdraw EOS from contract</h3>
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
            <h3>5. Withdraw BTC from script</h3>
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
