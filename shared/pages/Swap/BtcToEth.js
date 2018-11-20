import React, { Component, Fragment } from 'react'

import crypto from 'crypto'
import config from 'app-config'
import { BigNumber } from 'bignumber.js'

import actions from 'redux/actions'

import Timer from './Timer/Timer'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import { TimerButton, Button } from 'components/controls'
import { FormattedMessage } from 'react-intl'


export default class BtcToEth extends Component {

  constructor({ swap, currencyData }) {
    super()

    this.swap = swap

    this.state = {
      currencyAddress: currencyData.address,
      flow: this.swap.flow.state,
      secret: crypto.randomBytes(32).toString('hex'),
      enabledButton: false,
    }
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
      4: 'lock-btc',
      5: 'wait-lock-eth',
      6: 'withdraw-eth',
      7: 'finish',
      8: 'end',
    }

    actions.analytics.swapEvent(stepNumbers[values.step], 'BTC2ETH')

    this.setState({
      flow: values,
    })
  }

  overProgress = ({ flow, length }) => {
    actions.loader.show(true, '', '', true, { flow, length, name: 'BTC2ETH' })
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
  }

  getRefundTxHex = () => {
    const { flow } = this.state

    if (flow.refundTxHex) {
      return flow.refundTxHex
    }
    else if (flow.btcScriptValues) {
      this.swap.flow.getRefundTxHex()
    }
  }


  render() {
    const { children } = this.props
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
              <FormattedMessage id="BtcToEth100" defaultMessage="This order doesn&apos;t have a buyer">
                {message => <h3>{message}</h3>}
              </FormattedMessage>
            ) : (
              <Fragment>
                <FormattedMessage id="BtcToEth105" defaultMessage="The order creator is offline. Waiting for him..">
                  {message => <h3>{message}</h3>}
                </FormattedMessage>
                <InlineLoader />
              </Fragment>
            )
          )
        }
        {
          !flow.isParticipantSigned && (
            <Fragment>
              <FormattedMessage
                id="BtcToEth116"
                defaultMessage="We are waiting for a market maker. If it does not appear within 5 minutes, the swap will be canceled automatically.">
                {message => <h3>{message}</h3>}
              </FormattedMessage>
              <InlineLoader />
            </Fragment>
          )
        }
        {
          flow.isParticipantSigned && (
            <Fragment>
              <FormattedMessage id="BtcToEth126" defaultMessage="2. Create a secret key">
                {message => <h3>{message}</h3>}
              </FormattedMessage>
              {
                !flow.secretHash ? (
                  <Fragment>
                    <input type="text" placeholder="Secret Key" defaultValue={secret} />
                    <br />
                    <TimerButton timeLeft={5} brand onClick={this.submitSecret}>
                      <FormattedMessage id="BtcToEth134" defaultMessage="Confirm" />
                    </TimerButton>
                  </Fragment>
                ) : (
                  <Fragment>
                    <FormattedMessage id="BtcToEth140" defaultMessage="Save the secret key! Otherwise there will be a chance you loose your money!">
                      {message => <div>{message}</div>}
                    </FormattedMessage>
                    <div>
                      <FormattedMessage id="BtcToEth143" defaultMessage="Secret Key: " />
                      <strong>{flow.secret}</strong>
                    </div>
                    <div>
                      <FormattedMessage id="BtcToEth146" defaultMessage="Secret Hash: " />
                      <strong>{flow.secretHash}</strong>
                    </div>
                  </Fragment>
                )
              }

              {
                flow.step === 3 && !flow.isBalanceEnough && !flow.isBalanceFetching && (
                  <Fragment>
                    <h3>
                      <FormattedMessage id="BtcToEth156" defaultMessage="Not enough money for this swap. Please charge the balance" />
                    </h3>
                    <div>
                      <div>
                        <FormattedMessage id="BtcToEth160" defaultMessage="Your balance: " />
                        <strong>{flow.balance}</strong> {this.swap.sellCurrency}
                      </div>
                      <div>
                        <FormattedMessage id="BtcToEth163" defaultMessage="Required balance: " />
                        <strong>{this.swap.sellAmount.toNumber()}</strong> {this.swap.sellCurrency}
                      </div>
                      <div>
                        <div>
                          <FormattedMessage id="BtcToEth167" defaultMessage="Your address: " />
                          <a href={`${config.link.bitpay}/address/${currencyAddress}`} target="_blank" el="noopener noreferrer">
                            {currencyAddress}
                          </a>
                        </div>
                        <hr />
                        <span>{flow.address}</span>
                      </div>
                      <br />
                      <Button brand onClick={this.updateBalance}>
                        <FormattedMessage id="174" defaultMessage="Continue" />
                      </Button>
                    </div>
                  </Fragment>
                )
              }
              {
                flow.step === 3 && flow.isBalanceFetching && (
                  <Fragment>
                    <FormattedMessage id="BtcToEth183" defaultMessage="Checking balance..">
                      {message => <div>{message}</div>}
                    </FormattedMessage>
                    <InlineLoader />
                  </Fragment>
                )
              }

              {
                (flow.step === 4 || flow.btcScriptValues) && (
                  <Fragment>
                    <FormattedMessage id="BtcToEth194" defaultMessage="3. Creating Bitcoin Script. Please wait, it will take a while" >
                      {message => <h3>{message}</h3>}
                    </FormattedMessage>
                    {
                      flow.btcScriptCreatingTransactionHash && (
                        <div>
                          <FormattedMessage id="BtcToEth199" defaultMessage="Transaction: " />
                          <strong>
                            <a href={`${config.link.bitpay}/tx/${flow.btcScriptCreatingTransactionHash}`} target="_blank" el="noopener noreferrer">
                              {flow.btcScriptCreatingTransactionHash}
                            </a>
                          </strong>
                        )
                        </div>
                      )
                    }
                    {
                      !flow.btcScriptValues && (
                        <InlineLoader />
                      )
                    }
                  </Fragment>
                )
              }
              {
                flow.btcScriptValues && !flow.isFinished && !flow.isEthWithdrawn && (
                  <Fragment>
                    <br />
                    { !flow.refundTxHex &&
                      <FormattedMessage id="BtcToEth226" defaultMessage="Create refund hex" >
                        {message => <Button brand onClick={this.getRefundTxHex}>{message}</Button>}
                      </FormattedMessage>
                    }
                    {
                      flow.refundTxHex && (
                        <div>
                          <a
                            href="https://wiki.swap.online/faq/my-swap-got-stuck-and-my-bitcoin-has-been-withdrawn-what-to-do/"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FormattedMessage id="BtcToEth233" defaultMessage="How refund your money ?" />
                          </a>
                          Refund hex transaction: <code> {flow.refundTxHex}</code>
                        </div>
                      )
                    }
                  </Fragment>
                )
              }
              {
                (flow.step === 5 || flow.isEthContractFunded) && (
                  <Fragment>
                    <FormattedMessage id="BtcToEth253" defaultMessage="4. ETH Owner received Bitcoin Script and Secret Hash. Waiting when he creates ETH Contract" >
                      {message => <h3>{message}</h3>}
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
                    <FormattedMessage id="BtcToEth266" defaultMessage="Transaction: " />
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
                  <FormattedMessage id="BtcToEth282" defaultMessage="5. ETH Contract created and charged. Requesting withdrawal from ETH Contract. Please wait" >
                    {message => <h3>{message}</h3>}
                  </FormattedMessage>
                )
              }
              {
                flow.ethSwapWithdrawTransactionHash && (
                  <div>
                    <FormattedMessage id="BtcToEth289" defaultMessage="Transaction: " />
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
                    <FormattedMessage id="BtcToEth312" defaultMessage="6. Money was transferred to your wallet. Check the balance. ">
                      {message => <h3>{message}</h3>}
                    </FormattedMessage>
                    <FormattedMessage id="BtcToEth315" defaultMessage="Thank you for using Swap.Online!">
                      {message => <h2>{message}</h2>}
                    </FormattedMessage>
                  </Fragment>
                )
              }
              {
                flow.step >= 5 && !flow.isFinished && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    { enabledButton && !flow.isEthWithdrawn &&
                      <Button brand onClick={this.tryRefund}>
                        <FormattedMessage id="BtcToEth325" defaultMessage="TRY REFUND" />
                      </Button>
                    }
                    <Timer
                      lockTime={flow.btcScriptValues.lockTime * 1000}
                      enabledButton={() => this.setState({ enabledButton: true })}
                    />
                  </div>
                )
              }
              {
                flow.refundTransactionHash && (
                  <div>
                    <FormattedMessage id="BtcToEth338" defaultMessage="Transaction: " />
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
