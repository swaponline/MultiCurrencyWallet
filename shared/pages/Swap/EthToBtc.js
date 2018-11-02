import React, { Component, Fragment } from 'react'

import actions from 'redux/actions'

import config from 'app-config'
import { BigNumber } from 'bignumber.js'

import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import TimerButton from 'components/controls/TimerButton/TimerButton'
import Button from 'components/controls/Button/Button'
import Timer from './Timer/Timer'
import { FormattedMessage } from 'react-intl'


export default class EthToBtc extends Component {

  constructor({ swap }) {
    super()

    this.swap = swap

    this.state = {
      flow: this.swap.flow.state,
      enabledButton: false,
      isShowingBitcoinScript: false,
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
      2: 'wait-lock-btc',
      3: 'verify-script',
      4: 'sync-balance',
      5: 'lock-eth',
      6: 'wait-withdraw-eth',
      7: 'withdraw-btc',
      8: 'finish',
      9: 'end',
    }

    actions.analytics.swapEvent(stepNumbers[values.step], 'ETH-BTC')

    this.setState({
      flow: values,
    })
  }

  overProgress = ({ flow, length }) => {
    actions.loader.show(true, '', '', true, { flow, length, name: 'ETH2BTC' })
  }

  signSwap = () => {
    this.swap.flow.sign()
  }

  confirmBTCScriptChecked = () => {
    this.swap.flow.verifyBtcScript()
  }

  updateBalance = () => {
    this.swap.flow.syncBalance()
  }

  tryRefund = () => {
    this.swap.flow.tryRefund()
  }

  toggleBitcoinScript = () => {
    this.setState({
      isShowingBitcoinScript: !this.state.isShowingBitcoinScript,
    })
  }

  render() {
    const { children } = this.props
    const { flow, enabledButton, isShowingBitcoinScript } = this.state

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
              <FormattedMessage id="EthToBtc99" defaultMessage="This order doesn&apos;t have a buyer">
                {message => <h3>{message}</h3>}
              </FormattedMessage>
            ) : (
              <Fragment>
                <FormattedMessage id="EthToBtc104" defaultMessage="The order creator is offline. Waiting for him..">
                  {message => <h3>{message}</h3>}
                </FormattedMessage>
                <InlineLoader />
              </Fragment>
            )
          )
        }
        {
          flow.isWaitingForOwner && (
            <Fragment>
              <FormattedMessage id="EthToBtc115" defaultMessage="Waiting for other user when he connect to the order">
                {message => <h3>{message}</h3>}
              </FormattedMessage>
              <InlineLoader />
            </Fragment>
          )
        }
        {
          flow.step === 1 && (
            <Fragment>
              <FormattedMessage
                id="EthToBtc125"
                defaultMessage=
                  "Confirmation of the transaction is necessary for crediting the reputation. If a user does not bring the deal to the end he gets a negative reputation.">
                {message => <div>{message}</div>}
              </FormattedMessage>
              <TimerButton timeLeft={5} brand onClick={this.signSwap}>
                <FormattedMessage id="EthToBtc128" defaultMessage="Sign" />
              </TimerButton>
              {
                (flow.isSignFetching || flow.signTransactionHash) && (
                  <Fragment>
                    <FormattedMessage id="EthToBtc134" defaultMessage="Please wait. Confirmation processing">
                      {message => <h4>{message}</h4>}
                    </FormattedMessage>
                    {
                      flow.signTransactionHash && (
                        <div>
                          <FormattedMessage id="EthToBtc139" defaultMessage="Transaction:" />
                          <strong>
                            <a
                              href={`${config.link.etherscan}/tx/${flow.signTransactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {flow.signTransactionHash}
                            </a>
                          </strong>
                        </div>
                      )
                    }
              }
                    {
                      flow.isSignFetching && (
                        <InlineLoader />
                      )
                    }
                  </Fragment>
                )
              }
            </Fragment>
          )
        }
        {
          flow.isMeSigned && (
            <Fragment>
              <FormattedMessage id="EthToBtc167" defaultMessage="2. Waiting BTC Owner creates Secret Key, creates BTC Script and charges it">
                {message => <h3>{message}</h3>}
              </FormattedMessage>
              {
                flow.step === 2 && (
                  <InlineLoader />
                )
              }

              {
                flow.secretHash && flow.btcScriptValues && (
                  <Fragment>
                    <FormattedMessage id="EthToBtc179" defaultMessage="3. Bitcoin Script created and charged. Please check the information below">
                      {message => <h3>{message}</h3>}
                    </FormattedMessage>
                    <div>
                      <FormattedMessage id="EthToBtc182" defaultMessage="Secret Hash:" />
                      <strong>{flow.secretHash}</strong>
                    </div>
                    <div>
                      <FormattedMessage id="EthToBtc185" defaultMessage="Script address:" />
                      <strong>
                        {
                          flow.btcScriptCreatingTransactionHash && (
                            <a
                              href={`${config.link.bitpay}/tx/${flow.btcScriptCreatingTransactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {flow.btcScriptCreatingTransactionHash}
                            </a>
                          )
                        }
                      </strong>
                    </div>
                }
                    <br />
                    <Fragment>
                      { flow.btcScriptValues &&
                        <span onClick={this.toggleBitcoinScript}>
                          <FormattedMessage id="EthToBtc204" defaultMessage="Show bitcoin script" />
                        </span>
                      }
                      { isShowingBitcoinScript && (
                        <pre>
                          <code>{`
  bitcoinjs.script.compile([
    bitcoin.core.opcodes.OP_RIPEMD160,
    Buffer.from('${flow.btcScriptValues.secretHash}', 'hex'),
    bitcoin.core.opcodes.OP_EQUALVERIFY,

    Buffer.from('${flow.btcScriptValues.recipientPublicKey}', 'hex'),
    bitcoin.core.opcodes.OP_EQUAL,
    bitcoin.core.opcodes.OP_IF,

    Buffer.from('${flow.btcScriptValues.recipientPublicKey}', 'hex'),
    bitcoin.core.opcodes.OP_CHECKSIG,

    bitcoin.core.opcodes.OP_ELSE,

    bitcoin.core.script.number.encode(${flow.btcScriptValues.lockTime}),
    bitcoin.core.opcodes.OP_CHECKLOCKTIMEVERIFY,
    bitcoin.core.opcodes.OP_DROP,
    Buffer.from('${flow.btcScriptValues.ownerPublicKey}', 'hex'),
    bitcoin.core.opcodes.OP_CHECKSIG,

    bitcoin.core.opcodes.OP_ENDIF,
  ])
                      `}
                          </code>
                        </pre>
                      )
                      }
                    </Fragment>

                    <br />
                    <br />

                    {
                      flow.step === 3 && (
                        <Fragment>
                          <br />
                          <TimerButton timeLeft={5} brand onClick={this.confirmBTCScriptChecked}>
                            <FormattedMessage id="EthToBtc247" defaultMessage="Everything is OK. Continue" />
                          </TimerButton>
                        </Fragment>
                      )
                    }
                  </Fragment>
                )
              }

              {
                flow.step === 4 && !flow.isBalanceEnough && !flow.isBalanceFetching && (
                  <Fragment>
                    <FormattedMessage id="EthToBtc260" defaultMessage="Not enough money for this swap. Please fund the balance">
                      {message => <h3>{message}</h3>}
                    </FormattedMessage>
                    <div>
                      <div>
                        <FormattedMessage id="EthToBtc264" defaultMessage="Your balance:" />
                        <strong>{flow.balance}</strong> {this.swap.sellCurrency}
                      </div>
                      <div>
                        <FormattedMessage id="EthToBtc267" defaultMessage="Required balance:" />
                        <strong>{this.swap.sellAmount.toNumber()}</strong> {this.swap.sellCurrency}
                      </div>
                      <div>
                        <FormattedMessage id="EthToBtc270" defaultMessage="Your address:" />
                        {this.swap.flow.myEthAddress}
                      </div>
                      <hr />
                      <span>{flow.address}</span>
                    </div>
                    <br />
                    <Button brand onClick={this.updateBalance}>
                      <FormattedMessage id="EthToBtc277" defaultMessage="Continue" />
                    </Button>
                  </Fragment>
                )
              }
              {
                flow.step === 4 && flow.isBalanceFetching && (
                  <Fragment>
                    <FormattedMessage id="EthToBtc286" defaultMessage="Checking balance..">
                      {message => <div>{message}</div>}
                    </FormattedMessage>
                    <InlineLoader />
                  </Fragment>
                )
              }

              {
                (flow.step >= 5 || flow.isEthContractFunded) && (
                  <Fragment>
                    <FormattedMessage id="EthToBtc297" defaultMessage="4. Creating Ethereum Contract. Please wait, it will take a while">
                      {message => <h3>{message}</h3>}
                    </FormattedMessage>
                  </Fragment>
                )
              }
              {
                flow.ethSwapCreationTransactionHash && (
                  <div>
                    <FormattedMessage id="EthToBtc305" defaultMessage="Transaction:" />
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
                flow.step === 5 && (
                  <InlineLoader />
                )
              }
              {
                flow.refundTransactionHash && (
                  <div>
                    <FormattedMessage id="EthToBtc326" defaultMessage="Transaction:" />
                    <strong>
                      <a
                        href={`${config.link.etherscan}/tx/${flow.refundTransactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {flow.refundTransactionHash}
                      </a>
                    </strong>
                  </div>
                )
              }
              {
                (flow.step === 6 || flow.isEthWithdrawn) && (
                  <Fragment>
                    <FormattedMessage id="EthToBtc343" defaultMessage="5. Waiting BTC Owner adds Secret Key to ETH Contact">
                      {message => <h3>{message}</h3>}
                    </FormattedMessage>
                    {
                      !flow.isEthWithdrawn && (
                        <InlineLoader />
                      )
                    }
                  </Fragment>
                )
              }

              {
                (flow.step === 7 || flow.isBtcWithdrawn) && (
                  <FormattedMessage
                    id="EthToBtc357"
                    defaultMessage=
                      "6. BTC Owner successfully took money from ETH Contract and left Secret Key. Requesting withdrawal from BTC Script. Please wait"
                  >
                    {message => <h3>{message}</h3>}
                  </FormattedMessage>
                )
              }
              {
                flow.btcSwapWithdrawTransactionHash && (
                  <div>
                    <FormattedMessage id="EthToBtc364" defaultMessage="Transaction:" />
                    <strong>
                      <a
                        href={`${config.link.bitpay}/tx/${flow.btcSwapWithdrawTransactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {flow.btcSwapWithdrawTransactionHash}
                      </a>
                    </strong>
                  </div>
                )
              }
              {
                flow.step === 7 && (
                  <InlineLoader />
                )
              }

              {
                flow.isBtcWithdrawn && (
                  <Fragment>
                    <FormattedMessage id="EthToBtc387" defaultMessage="7. Money was transferred to your wallet. Check the balance.">
                      {message => <h3>{message}</h3>}
                    </FormattedMessage>
                    <FormattedMessage id="EthToBtc390" defaultMessage="Thank you for using Swap.Online!">
                      {message => <h2>{message}</h2>}
                    </FormattedMessage>
                  </Fragment>
                )
              }
              {
                flow.step >= 6 && !flow.isFinished && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    { enabledButton && !flow.isBtcWithdrawn && (
                      <Button brand onClick={this.tryRefund}>
                        <FormattedMessage id="EthToBtc400" defaultMessage="TRY REFUND" />
                      </Button>
                    )}
                    <Timer lockTime={(flow.btcScriptValues.lockTime - 5400) * 1000} enabledButton={() => this.setState({ enabledButton: true })} />
                  </div>
                )
              }
              {
                flow.refundTransactionHash && (
                  <div>
                    <FormattedMessage id="EthToBtc412" defaultMessage="Transaction:" />
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
        {/* { !flow.isFinished && <Button white onClick={this.addGasPrice}>Add gas price</Button> } */}
        { children }
      </div>
    )
  }
}
