import React, { Component, Fragment } from 'react'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'

export default class EosToBtc extends Component {
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

  render() {
    const { flow } = this.state

    return (
      <div>
        <Fragment>
          <h3>1. Waiting for script...</h3>
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
            <h3>2. Opening swap...</h3>
            {
              flow.openTx === null && <InlineLoader />
            }
            {
              flow.openTx !== null && <TransactionLink type="EOS" id={flow.openTx} />
            }
          </Fragment>
        }

        {
          flow.step >= 3 &&
          <Fragment>
            <h3>3. Waiting for EOS withdrawal...</h3>
            {
              flow.eosWithdrawTx === null && <InlineLoader />
            }
            {
              flow.eosWithdrawTx !== null && <TransactionLink type="EOS" id={flow.eosWithdrawTx} />
            }
          </Fragment>
        }

        {
          flow.step >= 4 &&
            <Fragment>
              <h3>4. Withdrawing BTC...</h3>
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