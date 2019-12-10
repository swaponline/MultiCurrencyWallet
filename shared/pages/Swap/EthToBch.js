import React, { Component, Fragment } from 'react'

import actions from 'redux/actions'

import config from 'app-config'
import { BigNumber } from 'bignumber.js'
import CopyToClipboard from 'react-copy-to-clipboard'

import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import TimerButton from 'components/controls/TimerButton/TimerButton'
import Button from 'components/controls/Button/Button'
import Timer from './Timer/Timer'
import { FormattedMessage } from 'react-intl'


export default class EthToBch extends Component {

  constructor({ swap, currencyData, depositWindow }) {
    super()

    this.swap = swap

    this.state = {
      depositWindow,
      enabledButton: false,
      isAddressCopied: false,
      flow: this.swap.flow.state,
      isShowingBitcoinScript: false,
      currencyAddress: currencyData.address,
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
      2: 'wait-lock-bch',
      3: 'verify-script',
      4: 'sync-balance',
      5: 'lock-eth',
      6: 'wait-withdraw-eth',
      7: 'withdraw-bch',
      8: 'finish',
      9: 'end',
    }

    actions.analytics.swapEvent(stepNumbers[values.step], 'ETH-BCH')

    this.setState({
      flow: values,
    })

    // this.overProgress(values, Object.keys(stepNumbers).length)
  }

  // overProgress = (flow, length) => {
  //   actions.loader.show(true, '', '', true, { flow, length, name: 'ETH2BCH' })
  // }

  signSwap = () => {
    this.swap.flow.sign()
  }

  confirmBCHScriptChecked = () => {
    this.swap.flow.verifyBchScript()
  }

  updateBalance = () => {
    this.swap.flow.syncBalance()
  }

  tryRefund = () => {
    this.swap.flow.tryRefund()
    this.setState(() => ({ enabledButton: false }))
  }

  toggleBitcoinScript = () => {
    this.setState({
      isShowingBitcoinScript: !this.state.isShowingBitcoinScript,
    })
  }



  render() {
    const { children } = this.props
    const { currencyAddress, flow, enabledButton, isShowingBitcoinScript, isAddressCopied } = this.state
    const headingStyle = {
      color: '#5100dc',
      textTransform: 'uppercase',
      fontSize: '20px',
      marginTop: '20px',
      borderTop: '1px solid #5100dc',
      paddingTop: '20px' }

    return (
      <div>
        <div className={this.props.styles.swapWrapper}>
          {
            this.swap.id && (
              <strong>
                {this.swap.sellAmount.toNumber()}
                {this.swap.sellCurrency} &#10230;
                {this.swap.buyAmount.toNumber()}
                {this.swap.buyCurrency}
              </strong>
            )
          }
        </div>
        <div>
          {
            !this.swap.id && (
              this.swap.isMy ? (
                <h3>
                  <FormattedMessage id="EthToBtc99" defaultMessage="This order doesn&apos;t have a buyer" />
                </h3>
              ) : (
                <Fragment>
                  <h3>
                    <FormattedMessage id="EthToBtc104" defaultMessage="Waiting the order creator" />
                  </h3>
                  <InlineLoader />
                </Fragment>
              )
            )
          }
          {
            flow.isWaitingForOwner && (
              <Fragment>
                <h3 style={headingStyle}>
                  <FormattedMessage id="EthToBtc115" defaultMessage="Waiting for other user when he connect to the order" />
                </h3>
                <InlineLoader />
              </Fragment>
            )
          }
          {
            flow.step === 1 && (
              <Fragment>
                <div>
                  <FormattedMessage
                    id="EthToBtc125"
                    defaultMessage={`
                      "Confirmation of the transaction is necessary for crediting the reputation.
                      If a user does not bring the deal to the end he gets a negative credit to his reputation."
                    `}
                  />
                </div>
                <TimerButton timeLeft={5} brand onClick={this.signSwap}>
                  <FormattedMessage id="EthToBtc128" defaultMessage="Sign" />
                </TimerButton>
                {
                  (flow.isSignFetching || flow.signTransactionHash) && (
                    <Fragment>
                      <h4>
                        <FormattedMessage id="EthToBtc134" defaultMessage="Please wait. Confirmation processing" />
                      </h4>
                      {
                        flow.signTransactionHash && (
                          <div>
                            <FormattedMessage id="EthToBtc139" defaultMessage="Transaction: " />
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
          {flow.step > 1 && <h3 style={headingStyle}><FormattedMessage id="BchToEthToken157" defaultMessage="1. Confirmation" /></h3>}
          {
            flow.isMeSigned && (
              <Fragment>
                <h3 style={headingStyle}>
                  <FormattedMessage id="EthToBtc167" defaultMessage="2. Waiting for BCH Owner to create Secret Key, create BCH Script and charge it" />
                </h3>
                {
                  flow.step === 2 && (
                    <InlineLoader />
                  )
                }

                {
                  flow.secretHash && flow.bchScriptValues && (
                    <Fragment>
                      <h3 style={headingStyle}>
                        <FormattedMessage id="EthToBtc179" defaultMessage="3. The bitcoin cash Script was created and charged. Please check the information below" />
                      </h3>
                      <div>
                        <FormattedMessage id="EthToBtc182" defaultMessage="Secret Hash: " />
                        <strong>{flow.secretHash}</strong>
                      </div>
                      <div>
                        <strong>
                          {
                            flow.bchScriptCreatingTransactionHash && (
                              <a
                                href={`${config.link.bch}/tx/${flow.bchScriptCreatingTransactionHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {flow.bchScriptCreatingTransactionHash}
                              </a>
                            )
                          }
                        </strong>
                      </div>
                      <br />
                      <Fragment>
                        { flow.bchScriptValues &&
                          <span onClick={this.toggleBitcoinScript}>
                            <FormattedMessage id="EthToBtc204" defaultMessage="Show bitcoin cash script" />
                          </span>
                        }
                        { isShowingBitcoinScript && (
                          <pre>
                            <code>{`
    bitcoincashjs.script.compile([
      bitcoincash.core.opcodes.OP_RIPEMD160,
      Buffer.from('${flow.bchScriptValues.secretHash}', 'hex'),
      bitcoincash.core.opcodes.OP_EQUALVERIFY,
      Buffer.from('${flow.bchScriptValues.recipientPublicKey}', 'hex'),
      bitcoincash.core.opcodes.OP_EQUAL,
      bitcoincash.core.opcodes.OP_IF,
      Buffer.from('${flow.bchScriptValues.recipientPublicKey}', 'hex'),
      bitcoincash.core.opcodes.OP_CHECKSIG,
      bitcoincash.core.opcodes.OP_ELSE,
      bitcoincash.core.script.number.encode(${flow.bchScriptValues.lockTime}),
      bitcoincash.core.opcodes.OP_CHECKLOCKTIMEVERIFY,
      bitcoincash.core.opcodes.OP_DROP,
      Buffer.from('${flow.bchScriptValues.ownerPublicKey}', 'hex'),
      bitcoincash.core.opcodes.OP_CHECKSIG,
      bitcoincash.core.opcodes.OP_ENDIF,
    ])
                        `}
                            </code>
                          </pre>
                        )
                        }
                      </Fragment>

                      <br />

                      {
                        flow.step === 3 && (
                          <Fragment>
                            <br />
                            <TimerButton timeLeft={5} brand onClick={this.confirmBCHScriptChecked}>
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
                      <h3 style={headingStyle}>
                        <FormattedMessage id="EthToBtc260" defaultMessage="Not enough money for this swap. Please fund the balance" />
                      </h3>
                      <div>
                        <div>
                          <FormattedMessage id="EthToBtc264" defaultMessage="Your balance: " />
                          <strong>{flow.balance}</strong> {this.swap.sellCurrency}
                        </div>
                        <div>
                          <FormattedMessage id="EthToBtc267" defaultMessage="Required balance: " />
                          <strong>{this.swap.sellAmount.toNumber()}</strong> {this.swap.sellCurrency}
                        </div>
                        <div>
                          <FormattedMessage id="EthToBtc270" defaultMessage="Your address: " />
                          <a href={`${config.link.etherscan}/address/${currencyAddress}`} target="_blank" rel="noopener noreferrer">
                            {currencyAddress}
                          </a>
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
                      <div>
                        <FormattedMessage id="EthToBtc286" defaultMessage="Checking balance.." />
                      </div>
                      <InlineLoader />
                    </Fragment>
                  )
                }
                {
                  (flow.step >= 5 || flow.isEthContractFunded) && (
                    <Fragment>
                      <h3 style={headingStyle}>
                        <FormattedMessage id="EthToBtc297" defaultMessage="5. Creating Ethereum Contract. Please wait, it can take a few minutes" />
                      </h3>
                    </Fragment>
                  )
                }
                {
                  flow.ethSwapCreationTransactionHash && (
                    <div>
                      <FormattedMessage id="EthToBtc305" defaultMessage="Transaction: " />
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
                      <FormattedMessage id="EthToBtc326" defaultMessage="Transaction: " />
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
                      <h3 style={headingStyle}>
                        <FormattedMessage id="EthToBtc343" defaultMessage="6. Waiting for BCH Owner to add a Secret Key to ETH Contact" />
                      </h3>
                      {
                        !flow.isEthWithdrawn && (
                          <InlineLoader />
                        )
                      }
                    </Fragment>
                  )
                }

                {
                  (flow.step === 7 || flow.isBchWithdrawn) && (
                    <h3 style={headingStyle}>
                      <FormattedMessage
                        id="EthToBtc357"
                        defaultMessage="7. The funds from ETH contract was successfully transferred to BCH owner. BCH owner left a secret key. Requesting withdrawal from BCH script. Please wait." // eslint-disable-line
                      />
                    </h3>
                  )
                }
                {
                  flow.bchSwapWithdrawTransactionHash && (
                    <div>
                      <FormattedMessage id="EthToBtc364" defaultMessage="Transaction: " />
                      <strong>
                        <a
                          href={`${config.link.bch}/tx/${flow.bchSwapWithdrawTransactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {flow.bchSwapWithdrawTransactionHash}
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
                  flow.isBchWithdrawn && (
                    <Fragment>
                      <h3 style={headingStyle}>
                        <FormattedMessage id="EthToBtc387" defaultMessage="8. BCH was transferred to your wallet. Check the balance." />
                      </h3>
                      <h3 style={headingStyle}>
                        <FormattedMessage id="EthToBtc390" defaultMessage="Thank you for using  AtomicSwapWallet.io!" />
                      </h3>
                    </Fragment>
                  )
                }
                {
                  flow.step >= 6 && !flow.isFinished && (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      { enabledButton && !flow.isBchWithdrawn && (
                        <Button brand onClick={this.tryRefund}>
                          <FormattedMessage id="EthToBtc400" defaultMessage="TRY REFUND" />
                        </Button>
                      )}
                      <Timer lockTime={(flow.bchScriptValues.lockTime - 5400) * 1000} enabledButton={() => this.setState({ enabledButton: true })} />
                    </div>
                  )
                }
                {
                  flow.refundTransactionHash && (
                    <div>
                      <FormattedMessage id="EthToBtc412" defaultMessage="Transaction: " />
                      <strong>
                        <a
                          href={`${config.link.bch}/tx/${flow.refundTransactionHash}`}
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
        </div>
      </div>
    )
  }
}
