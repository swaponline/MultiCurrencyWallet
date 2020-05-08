import React, { Component, Fragment } from 'react'

import crypto from 'crypto'
import config from 'app-config'
import { BigNumber } from 'bignumber.js'

import actions from 'redux/actions'

import Timer from './Timer/Timer'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import { TimerButton, Button } from 'components/controls'
import { FormattedMessage } from 'react-intl'


export default class LtcToEth extends Component {

  constructor({ swap, currencyData }) {
    super()

    this.swap = swap

    this.state = {
      currencyAddress: currencyData.address,
      flow: this.swap.flow.state,
      secret: crypto.randomBytes(32).toString('hex'),
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
    const stepNumbers = {
      1: 'sign',
      2: 'submit-secret',
      3: 'sync-balance',
      4: 'lock-ltc',
      5: 'wait-lock-eth',
      6: 'withdraw-eth',
      7: 'finish',
      8: 'end',
    }

    // actions.analytics.swapEvent(stepNumbers[values.step], 'LTC2ETH')

    this.setState({
      flow: values,
    })
  }

  overProgress = ({ flow, length }) => {
    actions.loader.show(true, '', '', true, { flow, length, name: 'LTC2ETH' })
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
    this.setState(() => ({ enabledButton: false }))
  }

  getRefundTxHex = () => {
    const { flow } = this.state

    if (flow.refundTxHex) {
      return flow.refundTxHex
    }
    else if (flow.ltcScriptValues) {
      this.swap.flow.getRefundTxHex()
    }
  }


  render() {
    const { children, disabledTimer }  = this.props
    const { currencyAddress, secret, flow, enabledButton } = this.state

    return (
      <div>
        {
          this.swap.id && (
            <strong>{this.swap.sellAmount.toNumber()} {this.swap.sellCurrency} &#10230; {this.swap.buyAmount.toNumber()} {this.swap.buyCurrency}</strong>
          )
        }
        {
          !this.swap.id && (
            this.swap.isMy ? (
              <h3>
                <FormattedMessage id="LtcTOeth101" defaultMessage="This order doesn&apos;t have a buyer" />
              </h3>
            ) : (
              <Fragment>
                <h3>
                  <FormattedMessage id="LtcToEth.orderCreatorIsOffline" defaultMessage="The order creator is offline. Waiting for him.." />
                </h3>
                <InlineLoader />
              </Fragment>
            )
          )
        }
        {
          !flow.isParticipantSigned && (
            <Fragment>
              <h3>
                <FormattedMessage
                  id="LtcTOeth117"
                  defaultMessage="Waiting for a market maker. If the market maker does not appear within 5 minutes, the swap will be canceled automatically." />
              </h3>
              <InlineLoader />
            </Fragment>
          )
        }
        {
          flow.isParticipantSigned && (
            <Fragment>
              <h3>
                <FormattedMessage id="LtcTOeth127" defaultMessage="2. Create a secret key" />
              </h3>
              {
                !flow.secretHash ? (
                  <Fragment>
                    <input type="text" placeholder="Secret Key" defaultValue={secret} />
                    <br />
                    <TimerButton disabledTimer={disabledTimer} timeLeft={5} brand onClick={this.submitSecret}>
                      <FormattedMessage id="LtcTOeth136" defaultMessage="Confirm" />
                    </TimerButton>
                  </Fragment>
                ) : (
                  <Fragment>
                    <div>
                      <FormattedMessage id="LtcTOeth142" defaultMessage="Save the secret key! Otherwise there will be a chance you loose your money!" />
                    </div>
                    <div>
                      <FormattedMessage id="LtcTOeth145" defaultMessage="Secret Key: " />
                      <strong>{flow.secret}</strong>
                    </div>
                    <div>
                      <FormattedMessage id="LtcTOeth148" defaultMessage="Secret Hash: " />
                      <strong>{flow.secretHash}</strong>
                    </div>
                  </Fragment>
                )
              }

              {
                flow.step === 3 && !flow.isBalanceEnough && !flow.isBalanceFetching && (
                  <Fragment>
                    <h3>
                      <FormattedMessage id="LtcTOeth158" defaultMessage="Not enough money for this swap. Please charge the balance" />
                      <strong>{flow.secretHash}</strong>
                    </h3>
                    <div>
                      <div>
                        <FormattedMessage id="LtcTOeth162" defaultMessage="Your balance: " />
                        <strong>{flow.balance}</strong> {this.swap.sellCurrency}
                      </div>
                      <div>
                        <FormattedMessage id="LtcTOeth165" defaultMessage="Required balance: " />
                        <strong>{this.swap.sellAmount.toNumber()}</strong>
                        {this.swap.sellCurrency}
                      </div>
                      <div>
                        <FormattedMessage id="LtcTOeth168" defaultMessage="Your address: " />
                        <a href={`${config.link.ltc}/address/${currencyAddress}`} target="_blank" el="noopener noreferrer">
                          {currencyAddress}
                        </a>
                      </div>
                      <hr />
                      <span>{flow.address}</span>
                    </div>
                    <br />
                    <Button brand onClick={this.updateBalance}>
                      <FormattedMessage id="LtcTOeth175" defaultMessage="Continue" />
                    </Button>
                  </Fragment>
                )
              }
              {
                flow.step === 3 && flow.isBalanceFetching && (
                  <Fragment>
                    <div>
                      <FormattedMessage id="LtcTOeth184" defaultMessage="Checking balance.." />
                      {this.swap.flow.myLtcAddress}
                    </div>
                    <InlineLoader />
                  </Fragment>
                )
              }

              {
                (flow.step === 4 || flow.ltcScriptValues) && (
                  <Fragment>
                    <h3>
                      <FormattedMessage id="LtcTOeth195" defaultMessage="3. Creating Litecoin Script.{br}Please wait, it can take a few minutes" values={{ br: <br /> }} />
                      {this.swap.flow.myLtcAddress}
                    </h3>
                    {
                      flow.ltcScriptCreatingTransactionHash && (
                        <div>
                          <FormattedMessage id="LtcTOeth200" defaultMessage="Transaction: " />
                          <strong>
                            <a
                              href={`${config.link.ltc}/tx/${flow.ltcScriptCreatingTransactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {flow.ltcScriptCreatingTransactionHash}
                            </a>
                          </strong>
                        </div>
                      )
                    }
                    {
                      !flow.ltcScriptValues && (
                        <InlineLoader />
                      )
                    }
                  </Fragment>
                )
              }
              {
                flow.ltcScriptValues && !flow.isFinished && !flow.isEthWithdrawn && (
                  <Fragment>
                    <br />
                    { !flow.refundTxHex &&
                      <Button brand onClick={this.getRefundTxHex}>
                        <FormattedMessage id="LtcTOeth227" defaultMessage="Create refund hex" />
                      </Button>
                    }
                    {
                      flow.refundTxHex && (
                        <div>
                          <a
                            href="#"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FormattedMessage id="LtcTOeth234" defaultMessage="How refund your money ?" />
                          </a>
                          Refund hex transaction:
                          <code>
                            {flow.refundTxHex}
                          </code>
                        </div>
                      )
                    }
                  </Fragment>
                )
              }
              {
                (flow.step === 5 || flow.isEthContractFunded) && (
                  <Fragment>
                    <h3>
                      <FormattedMessage id="LtcTOeth254" defaultMessage="4. ETH Owner received Litecoin Script and Secret Hash. Waiting when he creates ETH Contract" />
                    </h3>
                    {
                      !flow.isEthContractFunded && (
                        <InlineLoader />
                      )
                    }
                  </Fragment>
                )
              }
              {
                flow.ethSwapCreationTransactionHash && (
                  <div>
                    <FormattedMessage id="LtcTOeth267" defaultMessage="Transaction: " />
                    <strong>
                      <a
                        href={`${config.link.etherscan}/tx/${flow.ethSwapCreationTransactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {flow.ethSwapCreationTransactionHash}
                      </a>
                    </strong>
                  </div>
                )
              }
              {
                (flow.step === 6 || flow.isEthWithdrawn) && (
                  <h3>
                    <FormattedMessage id="LtcTOeth283" defaultMessage="5. ETH Contract created and charged. Requesting withdrawal from ETH Contract. Please wait" />
                  </h3>
                )
              }
              {
                flow.ethSwapWithdrawTransactionHash && (
                  <div>
                    <FormattedMessage id="LtcTOeth290" defaultMessage="Transaction: " />
                    <strong>
                      <a
                        href={`${config.link.etherscan}/tx/${flow.ethSwapWithdrawTransactionHash}`}
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
                  <InlineLoader />
                )
              }

              {
                flow.isEthWithdrawn && (
                  <Fragment>
                    <h3>
                      <FormattedMessage id="LtcTOeth313" defaultMessage="6. ETH was transferred to your wallet. Check the balance." />
                    </h3>
                    <h2>
                      <FormattedMessage id="LtcTOeth315" defaultMessage="Thank you for using Wallet!" />
                    </h2>
                  </Fragment>
                )
              }
              {
                flow.step >= 5 && !flow.isFinished && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    { enabledButton && !flow.isEthWithdrawn &&
                      <Button brand onClick={this.tryRefund}>
                        <FormattedMessage id="LtcTOeth326" defaultMessage="TRY REFUND" />
                      </Button>
                    }
                    <div>
                      <Timer lockTime={flow.ltcScriptValues.lockTime * 1000} enabledButton={() => this.setState({ enabledButton: true })} />
                    </div>
                  </div>
                )
              }
              {
                flow.refundTransactionHash && (
                  <div>
                    <FormattedMessage id="LtcTOeth338" defaultMessage="Transaction: " />
                    <strong>
                      <a
                        href={`${config.link.ltc}/tx/${flow.refundTransactionHash}`}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        {flow.refundTransactionHash}
                      </a>
                    </strong>
                  </div>
                )
              }
            </Fragment>
          )
        }
        <br />
        {/* { !flow.isFinished && <Button green onClick={this.addGasPrice}>Add gas price</Button> } */}
        { children }
      </div>
    )
  }
}
