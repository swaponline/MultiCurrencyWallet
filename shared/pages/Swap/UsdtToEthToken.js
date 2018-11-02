import React, { Component, Fragment } from 'react'

import crypto from 'crypto'
import config from 'app-config'
import { BigNumber } from 'bignumber.js'

import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import TimerButton from 'components/controls/TimerButton/TimerButton'
import Button from 'components/controls/Button/Button'
import Timer from './Timer/Timer'
import { FormattedMessage } from 'react-intl'


export default class UsdtToEthToken extends Component {

  constructor({ swap }) {
    super()

    this.swap = swap

    this.state = {
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

  addGasPrice = () => {
    const gwei =  new BigNumber(String(this.swap.flow.ethTokenSwap.gasPrice)).plus(new BigNumber(1e9))
    this.swap.flow.ethTokenSwap.addGasPrice(gwei)
    this.swap.flow.restartStep()
  }

  getRefundTxHex = () => {
    const { flow } = this.state

    if (flow.refundTxHex) {
      return flow.refundTxHex
    }
    else if (flow.usdtScriptValues) {
      this.swap.flow.getRefundTxHex()
    }
  }

  render() {
    const { children } = this.props
    const { secret, flow, enabledButton } = this.state

    return (
      <div>
        {
          this.swap.id && (
            <strong>{this.swap.sellAmount.toNumber()} {this.swap.sellCurrency} &#10230; {this.swap.buyAmount.toNumber()} {this.swap.buyCurrency}</strong>
          )
        }
        {
          flow.isWaitingForOwner && (
            <Fragment>
              <FormattedMessage
                id="UsdrToEthToken83"
                defaultMessage="We are waiting for a market maker. If it does not appear within 5 minutes, the swap will be canceled automatically.">
                {message => <h3>{message}</h3>}
              </FormattedMessage>
              <InlineLoader />
            </Fragment>
          )
        }
        {
          (flow.step === 1 || flow.isMeSigned) && (
            <Fragment>
              <FormattedMessage id="UsdrToEthToken93" defaultMessage="1. Waiting participant confirm this swap">
                {message => <h3>{message}</h3>}
              </FormattedMessage>
              <InlineLoader />
            </Fragment>
          )
        }

        {/* ----------------------------------------------------------- */}

        {
          flow.isParticipantSigned && (
            <Fragment>
              <FormattedMessage id="UsdrToEthToken106" defaultMessage="2. Create a secret key">
                {message => <h3>{message}</h3>}
              </FormattedMessage>

              {
                !flow.secretHash ? (
                  <Fragment>
                    <input type="text" placeholder="Secret Key" defaultValue={secret} />
                    <br />
                    <TimerButton brand onClick={this.submitSecret}>
                      <FormattedMessage id="UsdrToEthToken115" defaultMessage="Confirm" />
                      {message}
                    </TimerButton>
                  </Fragment>
                ) : (
                  <Fragment>
                    <div>
                      <FormattedMessage id="UsdrToEthToken121" defaultMessage="Save the secret key! Otherwise there will be a chance that you&apos;ll lose your money!" />
                    </div>
                    <div>
                      <FormattedMessage id="UsdrToEthToken124" defaultMessage="Secret Key:" />
                      <strong>{flow.secret}</strong>
                    </div>
                    <div>
                      <FormattedMessage id="UsdrToEthToken127" defaultMessage="Secret Hash:" />
                      <strong>{flow.secretHash}</strong>
                    </div>
                  </Fragment>
                )
              }

              {
                flow.step === 3 && !flow.isBalanceEnough && !flow.isBalanceFetching && (
                  <Fragment>
                    <FormattedMessage id="UsdrToEthToken137" defaultMessage="Not enough money for this swap. Please charge the balance">
                      {message => <h3>{message}</h3>}
                    </FormattedMessage>
                    <div>
                      <div>
                        <FormattedMessage id="UsdrToEthToken141" defaultMessage="Your balance:" />
                        <strong>{flow.balance}</strong>
                        {this.swap.sellCurrency}
                      </div>
                      <div>
                        <FormattedMessage id="UsdrToEthToken144" defaultMessage="Required balance:" />
                        <strong>{this.swap.sellAmount.toNumber()}</strong>
                        {this.swap.sellCurrency}
                      </div>
                      <div>
                        <FormattedMessage id="UsdrToEthToken147" defaultMessage="Your address:" />
                        {this.swap.flow.myBtcAddress}
                      </div>

                      <hr />
                      <span>{flow.address}</span>
                    </div>
                    <br />
                    <TimerButton brand onClick={this.updateBalance}>
                      <FormattedMessage id="UsdrToEthToken154" defaultMessage="Continue" />
                    </TimerButton>
                  </Fragment>
                )
              }
              {
                flow.step === 3 && flow.isBalanceFetching && (
                  <Fragment>
                    <FormattedMessage id="UsdrToEthToken163" defaultMessage="Checking balance...">
                      {message => <div>{message} </div>}
                    </FormattedMessage>
                    <InlineLoader />
                  </Fragment>
                )
              }

              {
                (flow.step === 4 || flow.usdtScriptValues) && (
                  <Fragment>
                    <FormattedMessage id="UsdrToEthToken174" defaultMessage="3. Creating Bitcoin Omni Script. Please wait, it will take a while">
                      {message => <h3>{message} </h3>}
                    </FormattedMessage>
                    {
                      flow.usdtFundingTransactionHash && (
                        <div>
                          <FormattedMessage id="UsdrToEthToken179" defaultMessage="Transaction:" />
                          <strong>
                            <a href={`${config.link.bitpay}/tx/${flow.usdtFundingTransactionHash}`} target="_blank" rel="noopener noreferrer">
                              {flow.usdtFundingTransactionHash}
                            </a>
                          </strong>
                        </div>
                      )
                    }
                    {
                      !flow.usdtScriptValues && (
                        <InlineLoader />
                      )
                    }
                  </Fragment>
                )
              }
              {
                flow.usdtScriptValues && !flow.isFinished && !flow.isEthWithdrawn && (
                  <Fragment>
                    <br />
                    { !flow.refundTxHex &&
                      <Button brand onClick={this.getRefundTxHex}>
                        <FormattedMessage id="UsdrToEthToken206" defaultMessage="Create refund hex" />
                      </Button>
                    }
                    {
                      flow.refundTxHex && (
                        <div>
                          <a href="https://wiki.swap.online/faq/my-swap-got-stuck-and-my-bitcoin-has-been-withdrawn-what-to-do/" target="_blank" rel="noopener noreferrer">
                            <FormattedMessage id="UsdrToEthToken213" defaultMessage=" How to refund your money?" />
                          </a>
                        )}
                          Refund hex transaction:<code>{flow.refundTxHex}</code>
                        </div>
                      )
                    }
                  </Fragment>
                )
              }
              {
                (flow.step === 5 || flow.isEthContractFunded) && (
                  <Fragment>
                    <FormattedMessage id="UsdrToEthToken233" defaultMessage="4. ETH Owner received Bitcoin Omni Script and Secret Hash. Waiting until he creates ETH Contract">
                      {message => <h3>{message} </h3>}
                    </FormattedMessage>
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
                    <FormattedMessage id="UsdrToEthToken246" defaultMessage="Transaction:" />
                    <strong>
                      <a href={`${config.link.etherscan}/tx/${flow.ethSwapCreationTransactionHash}`} target="_blank" rel="noopener noreferrer">
                        {flow.ethSwapCreationTransactionHash}
                      </a>
                    </strong>
                  </div>
                )
              }

              {
                (flow.step === 6 || flow.isEthWithdrawn) && (
                  <h3>
                    <FormattedMessage id="UsdrToEthToken264" defaultMessage="5. ETH Contract is created and charged. Requesting withdrawal from ETH Contract. Please wait" />
                  </h3>
                )
              }
              {
                flow.ethSwapWithdrawTransactionHash && (
                  <div>
                    <FormattedMessage id="UsdrToEthToken271" defaultMessage="Transaction:" />
                    <strong>
                      <a href={`${config.link.etherscan}/tx/${flow.ethSwapWithdrawTransactionHash}`} target="_blank" rel="noreferrer noopener">
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
                    <FormattedMessage id="UsdrToEthToken294" defaultMessage="6. Money was transferred to your wallet. Check the balance.">
                      {message => <h3>{message} </h3>}
                    </FormattedMessage>
                    <FormattedMessage id="UsdrToEthToken297" defaultMessage="Thank you for using Swap.Online!">
                      {message => <h2>{message} </h2>}
                    </FormattedMessage>
                  </Fragment>
                )
              }
              {
                flow.step >= 5 && !flow.isFinished && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    { enabledButton && !flow.isEthWithdrawn && <Button brand onClick={this.tryRefund}>
                      <FormattedMessage id="UsdrToEthToken307" defaultMessage="TRY REFUND" />
                    </Button>
                    }
                    <Timer
                      lockTime={flow.usdtScriptValues.lockTime * 1000}
                      enabledButton={() => this.setState({ enabledButton: true })}
                    />
                  </div>
                )
              }
              {
                flow.refundTransactionHash && (
                  <div>
                    <FormattedMessage id="UsdrToEthToken320" defaultMessage="Transaction:" />
                    <strong>
                      <a
                        href={`${config.link.bitpay}/tx/${flow.refundTransactionHash}`}
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
