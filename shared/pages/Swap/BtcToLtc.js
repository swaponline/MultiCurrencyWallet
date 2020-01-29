import React, { Component, Fragment } from 'react'

import crypto from 'crypto'
import config from 'app-config'
import { BigNumber } from 'bignumber.js'

import actions from 'redux/actions'

import Timer from './Timer/Timer'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import { TimerButton, Button } from 'components/controls'
import { FormattedMessage } from 'react-intl'


export default class BtcToLtc extends Component {

  constructor({ swap, currencyData }) {
    super()

    this.swap = swap

    this.state = {
      enabledButton: false,
      flow: this.swap.flow.state,
      isShowingBitcoinScript: false,
      currencyAddress: currencyData.address,
      secret: crypto.randomBytes(32).toString('hex'),
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
      4: 'lock-btc',
      5: 'wait-lock-ltc',
      6: 'withdraw-ltc',
      7: 'finish',
      8: 'end',
    }

    // actions.analytics.swapEvent(stepNumbers[values.step], 'BTC2LTC')

    this.setState({
      flow: values,
    })
  }

  overProgress = ({ flow, length }) => {
    actions.loader.show(true, '', '', true, { flow, length, name: 'BTC2LTC' })
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
    else if (flow.btcScriptValues) {
      this.swap.flow.getRefundTxHex()
    }
  }

  toggleLitecoinScript = () => {
    this.setState({
      isShowingLitecoinScript: !this.state.isShowingLitecoinScript,
    })
  }

  render() {
    const { children, disabledTimer }  = this.props
    const { currencyAddress, secret, flow, enabledButton, isShowingLitecoinScript } = this.state

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
                <FormattedMessage id="doesn&apos;t" defaultMessage="This order doesn&apos;t have a buyer" />
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
          !flow.isParticipantSigned && (
            <Fragment>
              <h3>
                <FormattedMessage id="Waiting" defaultMessage="Waiting for other user when he connect to the order" />
              </h3>
              <InlineLoader />
            </Fragment>
          )
        }
        {
          flow.isParticipantSigned && (
            <Fragment>
              <h3>
                <FormattedMessage id="BTCTOLTC132" defaultMessage="2. Create a secret key" />
              </h3>

              {
                !flow.secretHash ? (
                  <Fragment>
                    <input type="text" placeholder="Secret Key" defaultValue={secret} />
                    <br />
                    <TimerButton disabledTimer={disabledTimer} timeLeft={5} brand onClick={this.submitSecret}>
                      <FormattedMessage id="BtcToLtc.Confirm" defaultMessage="Confirm" />
                    </TimerButton>
                  </Fragment>
                ) : (
                  <Fragment>
                    <div>
                      <FormattedMessage id="LTCTOBTC147" defaultMessage="Save the secret key! Otherwise there will be a chance you loose your money!" />
                    </div>
                    <div>
                      <FormattedMessage id="LTCTOBTC150" defaultMessage="Secret Key: " />
                      <strong>{flow.secret}</strong>
                    </div>
                    <div>
                      <FormattedMessage id="SecretHash" defaultMessage="Secret Hash: " />
                      <strong>{flow.secretHash}</strong>
                    </div>
                  </Fragment>
                )
              }

              {
                flow.step === 3 && !flow.isBalanceEnough && !flow.isBalanceFetching && (
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
                        <a href={`${config.link.bitpay}/address/${currencyAddress}`} target="_blank" el="noopener noreferrer">
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
                flow.step === 3 && flow.isBalanceFetching && (
                  <Fragment>
                    <div>
                      <FormattedMessage id="Checkingbalance" defaultMessage="Checking balance.." />
                    </div>
                    <InlineLoader />
                  </Fragment>
                )
              }

              {
                (flow.step === 4 || flow.btcScriptValues) && (
                  <Fragment>
                    <h3>
                      <FormattedMessage id="BtcToLtc205" defaultMessage="3. Creating Bitcoin Script.{br}Please wait, it can take a few minutes" values={{ br: <br /> }} />
                    </h3>
                    {
                      flow.btcScriptCreatingTransactionHash && (
                        <div>
                          <FormattedMessage id="Transaction" defaultMessage="Transaction: " />
                          <strong>
                            <a
                              href={`${config.link.bitpay}/tx/${flow.btcScriptCreatingTransactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {flow.btcScriptCreatingTransactionHash}
                            </a>
                          </strong>
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
                flow.btcScriptValues && !flow.isFinished && !flow.isLtcWithdrawn && (
                  <Fragment>
                    <br />
                    { !flow.refundTxHex &&
                      <Button brand onClick={this.getRefundTxHex}>
                        <FormattedMessage id="BTCtoLTC236" defaultMessage="Create refund hex" />
                      </Button>
                    }
                    {
                      flow.refundTxHex && (
                        <div>
                          <a
                            href="https://wiki.swaponline.io/faq/my-swap-got-stuck-and-my-bitcoin-has-been-withdrawn-what-to-do/"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FormattedMessage id="BTCtoLTC246" defaultMessage="How refund your money ?" />
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
                (flow.step === 5 || flow.isLtcScriptFunded) && (
                  <Fragment>
                    <h3>
                      <FormattedMessage id="BTCtoLTC262" defaultMessage="4. LTC Owner received Bitcoin Script and Secret Hash. Waiting when he creates LTC Script" />
                    </h3>
                    {
                      !flow.isLtcScriptFunded && (
                        <InlineLoader />
                      )
                    }
                  </Fragment>
                )
              }
              {
                (flow.step === 6 || flow.isLtcWithdrawn) && (
                  <Fragment>
                    <h3>
                      <FormattedMessage id="BTCtoLTC276" defaultMessage="5. Litecoin Script created and charged. Please check the information below" />
                    </h3>
                    <div>
                      <FormattedMessage id="SecretHash" defaultMessage="Secret Hash: " />
                      <strong>{flow.secretHash}</strong>
                    </div>
                    <div>
                      <FormattedMessage id="Scriptaddress:" defaultMessage="Script address: " />
                      <strong>
                        {
                          flow.ltcSwapCreationTransactionHash && (
                            <a
                              href={`${config.link.ltc}/tx/${flow.ltcSwapCreationTransactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {flow.ltcSwapCreationTransactionHash}
                            </a>
                          )
                        }
                      </strong>
                    </div>
                    <br />
                    <Fragment>
                      { flow.ltcScriptValues &&
                      <span onClick={this.toggleLitecoinScript}>
                        <FormattedMessage id="BTCtoLTC301" defaultMessage="Show litecoin script" />
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

                  </Fragment>
                )
              }
              {
                flow.ltcSwapWithdrawTransactionHash && (
                  <div>
                    <FormattedMessage id="Transaction" defaultMessage="Transaction: " />
                    <strong>
                      <a
                        href={`${config.link.ltc}/tx/${flow.ltcSwapWithdrawTransactionHash}`}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        {flow.ltcSwapWithdrawTransactionHash}
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
                flow.isLtcWithdrawn && (
                  <Fragment>
                    <h3>
                      <FormattedMessage id="MoneyWasTransferred" defaultMessage="6. LTC was transferred to your wallet. Check the balance." />
                    </h3>
                    <h2>
                      <FormattedMessage id="Thank" defaultMessage="Thank you for using Swap.Online!" />
                    </h2>
                  </Fragment>
                )
              }
              {
                flow.step >= 5 && !flow.isFinished && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    { enabledButton && !flow.isLtcWithdrawn &&
                    <Button brand onClick={this.tryRefund}>
                      <FormattedMessage id="REFUND" defaultMessage="TRY REFUND" />
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
        {/* { !flow.isFinished && <Button green onClick={this.addGasPrice}>Add gas price</Button> } */}
        { children }
      </div>
    )
  }
}
