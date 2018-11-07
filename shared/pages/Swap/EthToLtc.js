import React, { Component, Fragment } from 'react'

import actions from 'redux/actions'

import config from 'app-config'
import { BigNumber } from 'bignumber.js'

import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import TimerButton from 'components/controls/TimerButton/TimerButton'
import Button from 'components/controls/Button/Button'
import Timer from './Timer/Timer'
import { FormattedMessage } from 'react-intl'


export default class EthToLtc extends Component {

  constructor({ swap }) {
    super()

    this.swap = swap

    this.state = {
      flow: this.swap.flow.state,
      enabledButton: false,
      isShowingLitecoinScript: false,
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
      2: 'wait-lock-ltc',
      3: 'verify-script',
      4: 'sync-balance',
      5: 'lock-eth',
      6: 'wait-withdraw-eth',
      7: 'withdraw-ltc',
      8: 'finish',
      9: 'end',
    }

    actions.analytics.swapEvent(stepNumbers[values.step], 'ETH-LTC')

    this.setState({
      flow: values,
    })
  }

  overProgress = ({ flow, length }) => {
    actions.loader.show(true, '', '', true, { flow, length, name: 'ETH2LTC' })
  }

  signSwap = () => {
    this.swap.flow.sign()
  }

  confirmLTCScriptChecked = () => {
    this.swap.flow.verifyLtcScript()
  }

  updateBalance = () => {
    this.swap.flow.syncBalance()
  }

  tryRefund = () => {
    this.swap.flow.tryRefund()
  }

  toggleLitecoinScript = () => {
    this.setState({
      isShowingLitecoinScript: !this.state.isShowingLitecoinScript,
    })
  }

  render() {
    const { children } = this.props
    const { flow, enabledButton, isShowingLitecoinScript } = this.state

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
              <FormattedMessage id="EthToLtc99" defaultMessage="This order doesn&apos;t have a buyer">
                {message => <h3>{message}</h3>}
              </FormattedMessage>
            ) : (
              <Fragment>
                <FormattedMessage id="EthToLtc104" defaultMessage="The order creator is offline. Waiting for him..">
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
              <FormattedMessage id="EthToLtc115" defaultMessage="Waiting for other user when he connect to the order">
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
                id="EthToLtc125"
                defaultMessage=
                  "Confirmation of the transaction is necessary for crediting the reputation. If a user does not bring the deal to the end he gets a negative reputation."
              >
                {message => <div>{message}</div>}
              </FormattedMessage>
              <TimerButton timeLeft={5} brand onClick={this.signSwap}>
                <FormattedMessage id="EthToLtc128" defaultMessage="Sign" />
              </TimerButton>
              {
                (flow.isSignFetching || flow.signTransactionHash) && (
                  <Fragment>
                    <FormattedMessage id="EthToLtc134" defaultMessage="Please wait. Confirmation processing">
                      {message => <h4>{message}</h4>}
                    </FormattedMessage>
                    {
                      flow.signTransactionHash && (
                        <div>
                          <FormattedMessage id="EthToLtc139" defaultMessage="Transaction: " />
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
              <FormattedMessage id="EthToLtc167" defaultMessage="2. Waiting LTC Owner creates Secret Key, creates LTC Script and charges it">
                {message => <h3>{message}</h3>}
              </FormattedMessage>
              {
                flow.step === 2 && (
                  <InlineLoader />
                )
              }

              {
                flow.secretHash && flow.ltcScriptValues && (
                  <Fragment>
                    <FormattedMessage id="EthToLtc179" defaultMessage="3. Litecoin Script created and charged. Please check the information below">
                      {message => <h3>{message}</h3>}
                    </FormattedMessage>
                    <div>
                      <FormattedMessage id="EthToLtc182" defaultMessage="Secret Hash: " />
                      <strong>{flow.secretHash}</strong>
                    </div>
                    <div>
                      <FormattedMessage id="EthToLtc185" defaultMessage="Script address: " />
                      <strong>
                        {
                          flow.ltcScriptCreatingTransactionHash && (
                            <a
                              href={`${config.link.ltc}/tx/${flow.ltcScriptCreatingTransactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {flow.ltcScriptCreatingTransactionHash}
                            </a>
                          )
                        }
                      </strong>
                    </div>
                    <br />
                    <Fragment>
                      { flow.ltcScriptValues &&
                      <span onClick={this.toggleLitecoinScript}>
                        <FormattedMessage id="EthToLtc204" defaultMessage="Show litecoin script" />
                      </span>
                      }
                      { isShowingLitecoinScript && (
                        <pre>
                          <code>{`
  bitcoinjs.script.compile([
    bitcoin.core.opcodes.OP_RIPEMD160,
    Buffer.from('${flow.ltcScriptValues.secretHash}', 'hex'),
    bitcoin.core.opcodes.OP_EQUALVERIFY,

    Buffer.from('${flow.ltcScriptValues.recipientPublicKey}', 'hex'),
    bitcoin.core.opcodes.OP_EQUAL,
    bitcoin.core.opcodes.OP_IF,

    Buffer.from('${flow.ltcScriptValues.recipientPublicKey}', 'hex'),
    bitcoin.core.opcodes.OP_CHECKSIG,

    bitcoin.core.opcodes.OP_ELSE,

    bitcoin.core.script.number.encode(${flow.ltcScriptValues.lockTime}),
    bitcoin.core.opcodes.OP_CHECKLOCKTIMEVERIFY,
    bitcoin.core.opcodes.OP_DROP,
    Buffer.from('${flow.ltcScriptValues.ownerPublicKey}', 'hex'),
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
                          <TimerButton timeLeft={5} brand onClick={this.confirmLTCScriptChecked}>
                            <FormattedMessage id="EthToLtc247" defaultMessage="Everything is OK. Continue" />
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
                    <FormattedMessage id="EthToLtc260" defaultMessage="Not enough money for this swap. Please fund the balance">
                      {message => <h3>{message}</h3>}
                    </FormattedMessage>
                    <div>
                      <div>
                        <FormattedMessage id="EthToLtc264" defaultMessage="Your balance: " />
                        <strong>{flow.balance}</strong> {this.swap.sellCurrency}
                      </div>
                      <div>
                        <FormattedMessage id="EthToLtc267" defaultMessage="Required balance: " />
                        <strong>{this.swap.sellAmount.toNumber()}</strong> {this.swap.sellCurrency}
                      </div>
                      <div>
                        <FormattedMessage id="EthToLtc270" defaultMessage="Your address: " />
                        {this.swap.flow.myEthAddress}
                      </div>
                      <hr />
                      <span>{flow.address}</span>
                    </div>
                    <br />
                    <Button brand onClick={this.updateBalance}>
                      <FormattedMessage id="EthToLtc277" defaultMessage="Continue" />
                    </Button>
                  </Fragment>
                )
              }
              {
                flow.step === 4 && flow.isBalanceFetching && (
                  <Fragment>
                    <FormattedMessage id="EthToLtc286" defaultMessage="Checking balance..">
                      {message => <div>{message}</div>}
                    </FormattedMessage>
                    <InlineLoader />
                  </Fragment>
                )
              }

              {
                (flow.step >= 5 || flow.isEthContractFunded) && (
                  <Fragment>
                    <FormattedMessage id="EthToLtc297" defaultMessage="4. Creating Ethereum Contract. Please wait, it will take a while">
                      {message => <h3>{message}</h3>}
                    </FormattedMessage>
                  </Fragment>
                )
              }
              {
                flow.ethSwapCreationTransactionHash && (
                  <div>
                    <FormattedMessage id="EthToLtc305" defaultMessage="Transaction: " />
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
                    <FormattedMessage id="EthToLtc326" defaultMessage="Transaction: " />
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
                    <FormattedMessage id="EthToLtc343" defaultMessage="5. Waiting LTC Owner adds Secret Key to ETH Contact">
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
                (flow.step === 7 || flow.isLtcWithdrawn) && (
                  <FormattedMessage
                    id="EthToLtc357"
                    defaultMessage="6. LTC Owner successfully took money from ETH Contract and left Secret Key. Requesting withdrawal from LTC Script. Please wait">
                    {message => <h3>{message}</h3>}
                  </FormattedMessage>
                )
              }
              {
                flow.ltcSwapWithdrawTransactionHash && (
                  <div>
                    <FormattedMessage id="EthToLtc364" defaultMessage="Transaction: " />
                    <strong>
                      <a href={`${config.link.ltc}/tx/${flow.ltcSwapWithdrawTransactionHash}`} target="_blank" rel="noopener noreferrer" >
                        {flow.ltcSwapWithdrawTransactionHash}
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
                flow.isLtcWithdrawn && (
                  <Fragment>
                    <FormattedMessage id="EthToLtc386" defaultMessage="7. Money was transferred to your wallet. Check the balance.">
                      {message => <h3>{message}</h3>}
                    </FormattedMessage>
                    <FormattedMessage id="EthToLtc389" defaultMessage="Thank you for using Swap.Online!">
                      {message => <h2>{message}</h2>}
                    </FormattedMessage>
                  </Fragment>
                )
              }
              {
                flow.step >= 6 && !flow.isFinished && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    { enabledButton && !flow.isLtcWithdrawn &&
                      <Button brand onClick={this.tryRefund}>
                        <FormattedMessage id="EthToLtc399" defaultMessage="TRY REFUND" />
                      </Button>
                    }
                    <Timer
                      lockTime={(flow.ltcScriptValues.lockTime - 5400) * 1000}
                      enabledButton={() => this.setState({ enabledButton: true })}
                    />
                  </div>
                )
              }
              {
                flow.refundTransactionHash && (
                  <div>
                    <FormattedMessage id="EthToLtc412" defaultMessage="Transaction: " />
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
        {/* { !flow.isFinished && <Button white onClick={this.addGasPrice}>Add gas price</Button> } */}
        { children }
      </div>
    )
  }
}
