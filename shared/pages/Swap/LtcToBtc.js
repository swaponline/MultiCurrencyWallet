import React, { Component, Fragment } from 'react'

import actions from 'redux/actions'

import config from 'app-config'
import { BigNumber } from 'bignumber.js'

import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import TimerButton from 'components/controls/TimerButton/TimerButton'
import Button from 'components/controls/Button/Button'
import Timer from './Timer/Timer'
import { FormattedMessage } from 'react-intl'


export default class LtcToBtc extends Component {

  constructor({ swap, currencyData }) {
    super()

    this.swap = swap

    this.state = {
      currencyAddress: currencyData.address,
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
      5: 'lock-ltc',
      6: 'wait-withdraw-ltc',
      7: 'withdraw-btc',
      8: 'finish',
      9: 'end',
    }

    // actions.analytics.swapEvent(stepNumbers[values.step], 'LTC-BTC')

    this.setState({
      flow: values,
    })
  }

  overProgress = ({ flow, length }) => {
    actions.loader.show(true, '', '', true, { flow, length, name: 'LTC2BTC' })
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

  toggleBitcoinScript = () => {
    this.setState({
      isShowingBitcoinScript: !this.state.isShowingBitcoinScript,
    })
  }

  render() {
    const { children, disabledTimer }  = this.props
    const { currencyAddress, flow, enabledButton, isShowingBitcoinScript } = this.state

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
                <FormattedMessage id="doesn&apos" defaultMessage="This order doesn&apos;t have a buyer" />
              </h3>
            ) : (
              <Fragment>
                <h3>
                  <FormattedMessage id="offline" defaultMessage="The order creator is offline. Waiting for him.." />
                </h3>
                <InlineLoader />
              </Fragment>
            )
          )
        }
        {
          flow.isWaitingForOwner && (
            <Fragment>
              <h3>
                <FormattedMessage id="Waiting" defaultMessage="Waiting for other user when he connect to the order" />
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
                  id="Confirmation" // eslint-disable-next-line
                  defaultMessage="Confirmation of the transaction is necessary for crediting the reputation. If a user does not bring the deal to the end he gets a negative credit to his reputation." />
              </div>
              <TimerButton disabledTimer={disabledTimer} timeLeft={5} brand onClick={this.signSwap}>
                <FormattedMessage id="Sign" defaultMessage="Sign" />
              </TimerButton>
              {
                (flow.isSignFetching || flow.signTransactionHash) && (
                  <Fragment>
                    <h4>
                      <FormattedMessage id="PleaseWaitConfirmationProcessing" defaultMessage="Please wait. Confirmation processing" />
                    </h4>
                    {
                      flow.signTransactionHash && (
                        <div>
                          <FormattedMessage id="Transaction" defaultMessage="Transaction: " />
                          <strong>
                            <a
                              href={`${config.link.ltc}/tx/${flow.signTransactionHash}`}
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
              <h3>
                <FormattedMessage id="LtcToBtc.Confirm" defaultMessage="2. Waiting for BTC Owner to create Secret Key, create BTC Script and charge it" />
              </h3>
              {
                flow.step === 2 && (
                  <InlineLoader />
                )
              }

              {
                flow.secretHash && flow.btcScriptValues && (
                  <Fragment>
                    <h3>
                      <FormattedMessage id="LTCTOBTC191" defaultMessage="3. The bitcoin Script was created and charged. Please check the information below" />
                    </h3>
                    <div>
                      <FormattedMessage id="SecretHash" defaultMessage="Secret Hash: " />
                      <strong>{flow.secretHash}</strong>
                    </div>
                    <div>
                      <FormattedMessage id="Scriptaddress" defaultMessage="Script address: " />
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
                    <br />
                    <Fragment>
                      { flow.btcScriptValues &&
                      <span onClick={this.toggleBitcoinScript}>
                        <FormattedMessage id="LTCTOBTC216" defaultMessage="Show bitcoin script" />
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
                          <TimerButton disabledTimer={disabledTimer} timeLeft={5} brand onClick={this.confirmBTCScriptChecked}>
                            <FormattedMessage id="OK" defaultMessage="Everything is OK. Continue" />
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
                    <h3>
                      <FormattedMessage id="Notenough" defaultMessage="Not enough money for this swap. Please fund the balance" />
                    </h3>
                    <div>
                      <div>
                        <FormattedMessage id="balance" defaultMessage="Your balance: " />
                        <strong>{flow.balance}</strong> {this.swap.sellCurrency}
                      </div>
                      <div>
                        <FormattedMessage id="Required" defaultMessage="Required balance: " />
                        <strong>{this.swap.sellAmount.toNumber()}</strong> {this.swap.sellCurrency}
                      </div>
                      <div>
                        <FormattedMessage id="address" defaultMessage="Your address: " />
                        <a href={`${config.link.ltc}/address/${currencyAddress}`} target="_blank" el="noopener noreferrer">
                          {currencyAddress}
                        </a>
                      </div>
                      <hr />
                      <span>{flow.address}</span>
                    </div>
                    <br />
                    <Button brand onClick={this.updateBalance}>
                      <FormattedMessage id="Continue" defaultMessage="Continue" />
                    </Button>
                  </Fragment>
                )
              }
              {
                flow.step === 4 && flow.isBalanceFetching && (
                  <Fragment>
                    <div>
                      <FormattedMessage id="Checkingbalance" defaultMessage="Checking balance.." />
                    </div>
                    <InlineLoader />
                  </Fragment>
                )
              }

              {
                (flow.step >= 5 || flow.isLtcScriptFunded) && (
                  <Fragment>
                    <h3>
                      <FormattedMessage id="LtcToBtc205" defaultMessage="4. Creating LTC Script.{br}Please wait, it can take a few minutes" values={{ br: <br /> }} />
                    </h3>
                  </Fragment>
                )
              }
              {
                flow.ltcSwapCreationTransactionHash && (
                  <div>
                    <FormattedMessage id="Transaction" defaultMessage="Transaction: " />
                    <strong>
                      <a
                        href={`${config.link.ltc}/tx/${flow.ltcSwapCreationTransactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {flow.ltcSwapCreationTransactionHash}
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
                    <FormattedMessage id="Transaction" defaultMessage="Transaction: " />
                    <strong>
                      <a
                        href={`${config.link.ltc}/tx/${flow.refundTransactionHash}`}
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
                (flow.step === 6 || flow.isLtcWithdrawn) && (
                  <Fragment>
                    <h3>
                      <FormattedMessage id="LTCTOBTC350" defaultMessage="5. Waiting for BTC Owner to add a Secret Key to LTC Contact" />
                    </h3>
                    {
                      !flow.isLtcWithdrawn && (
                        <InlineLoader />
                      )
                    }
                  </Fragment>
                )
              }

              {
                (flow.step === 7 || flow.isBtcWithdrawn) && (
                  <h3>
                    <FormattedMessage
                      id="LTCTOBTC365"
                      defaultMessage="6. BTC Owner successfully took money from LTC Script and left Secret Key. Requesting withdrawal from BTC Script. Please wait" />
                  </h3>
                )
              }
              {
                flow.btcSwapWithdrawTransactionHash && (
                  <div>
                    <FormattedMessage id="Transaction" defaultMessage="Transaction: " />
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
                    <h3>
                      <FormattedMessage id="LTCTOBTC396" defaultMessage="7. BTC was transferred to your wallet. Check the balance." />
                    </h3>
                    <h2>
                      <FormattedMessage id="Thank" defaultMessage="Thank you for using  AtomicSwapWallet.io!" />
                    </h2>
                  </Fragment>
                )
              }
              {
                flow.step >= 6 && !flow.isFinished && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    { enabledButton && !flow.isBtcWithdrawn &&
                    <Button brand onClick={this.tryRefund}>
                      <FormattedMessage id="REFUND" defaultMessage="TRY REFUND" />
                    </Button>
                    }
                    <Timer
                      lockTime={(flow.btcScriptValues.lockTime - 5400) * 1000}
                      enabledButton={() => this.setState({ enabledButton: true })}
                    />
                  </div>
                )
              }
              {
                flow.refundTransactionHash && (
                  <div>
                    <FormattedMessage id="Transaction" defaultMessage="Transaction: " />
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
