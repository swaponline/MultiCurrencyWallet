import React, { Component, Fragment } from 'react'

import config from 'app-config'
import { BigNumber } from 'bignumber.js'

import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import TimerButton from 'components/controls/TimerButton/TimerButton'
import Button from 'components/controls/Button/Button'
import Timer from './Timer/Timer'
import { FormattedMessage } from 'react-intl'


export default class EthTokenToUsdt extends Component {

  constructor({ swap, currencyData }) {
    super()

    this.swap = swap

    this.state = {
      currencyAddress: currencyData.address,
      flow: this.swap.flow.state,
      enabledButton: false,
    }
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

  addGasPrice = () => {
    const gwei =  new BigNumber(String(this.swap.flow.ethTokenSwap.gasPrice)).plus(new BigNumber(1e10))
    this.swap.flow.ethTokenSwap.addGasPrice(gwei)
    this.swap.flow.restartStep()
  }

  render() {
    const { children } = this.props
    const { currencyAddress, flow, enabledButton, isShowingBitcoinScript } = this.state

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
              <FormattedMessage id="EthTokenToUsdt84" defaultMessage="Waiting for other user when he connect to the order">
                {message => <h3>{message}</h3>}
              </FormattedMessage>
              <InlineLoader />
            </Fragment>
          )
        }
        {
          (flow.step === 1 || flow.isMeSigned) && (
            <FormattedMessage id="EthTokenToUsdt93" defaultMessage="1. Please confirm your participation to begin the deal">
              {message => <h3>{message}</h3>}
            </FormattedMessage>
          )
        }
        {
          flow.step === 1 && (
            <Fragment>
              <FormattedMessage
                id="EthTokenToUsdt101"
                defaultMessage=
                  "Confirmation of the transaction is necessary for crediting the reputation. If a user does not bring the deal to the end he gets a negative reputation."
              >
                {message => <div>{message}</div>}
              </FormattedMessage>
              {
                !flow.isSignFetching && !flow.isMeSigned && (
                  <Fragment>
                    <br />
                    <TimerButton brand onClick={this.signSwap}>
                      <FormattedMessage id="EthTokenToUsdt109" defaultMessage="Confirm" />
                    </TimerButton>
                  </Fragment>
                )
              }
              {
                (flow.isSignFetching || flow.signTransactionHash) && (
                  <Fragment>
                    <FormattedMessage id="EthTokenToUsdt118" defaultMessage="Please wait. Confirmation processing">
                      {message => <h4>{message}</h4>}
                    </FormattedMessage>
                    {
                      flow.signTransactionHash && (
                        <div>
                          <FormattedMessage id="EthTokenToUsdt123" defaultMessage="Transaction: " />
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

        {/* -------------------------------------------------------------- */}

        {
          flow.isMeSigned && (
            <Fragment>
              <FormattedMessage id="EthTokenToUsdt154" defaultMessage="2. Waiting USDT Owner creates Secret Key, creates BTC Omni Script and charges it">
                {message => <h3>{message}</h3>}
              </FormattedMessage>
              {
                flow.step === 2 && (
                  <InlineLoader />
                )
              }

              {
                flow.secretHash && flow.usdtScriptValues && (
                  <Fragment>
                    <FormattedMessage id="EthTokenToUsdt166" defaultMessage="3. Bitcoin Omni Script created and charged. Please check the information below">
                      {message => <h3>{message}</h3>}
                    </FormattedMessage>
                    <FormattedMessage id="EthTokenToUsdt169" defaultMessage="Secret Hash: ">
                      {message => <div>{message}<strong>{flow.secretHash}</strong></div>}
                    </FormattedMessage>
                    <div>
                      <FormattedMessage id="EthTokenToUsdt172" defaultMessage="Script address: " />
                      <strong>
                        {
                          flow.usdtFundingTransactionHash && (
                            <a
                              href={`${config.link.bitpay}/tx/${flow.usdtFundingTransactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {flow.usdtFundingTransactionHash}
                            </a>
                          )
                        }
                      </strong>
                    </div>
                    <br />
                    <Fragment>
                      { flow.usdtScriptValues &&
                        <span onClick={this.toggleBitcoinScript}>
                          <FormattedMessage id="EthTokenToUsdt192" defaultMessage="Show bitcoin script " />
                        </span>
                      }
                      { isShowingBitcoinScript && (
                        <pre>
                          <code>{`
  bitcoinjs.script.compile([
    bitcoin.core.opcodes.OP_RIPEMD160,
    Buffer.from('${flow.usdtScriptValues.secretHash}', 'hex'),
    bitcoin.core.opcodes.OP_EQUALVERIFY,

    Buffer.from('${flow.usdtScriptValues.recipientPublicKey}', 'hex'),
    bitcoin.core.opcodes.OP_EQUAL,
    bitcoin.core.opcodes.OP_IF,

    Buffer.from('${flow.usdtScriptValues.recipientPublicKey}', 'hex'),
    bitcoin.core.opcodes.OP_CHECKSIG,

    bitcoin.core.opcodes.OP_ELSE,

    bitcoin.core.script.number.encode(${flow.usdtScriptValues.lockTime}),
    bitcoin.core.opcodes.OP_CHECKLOCKTIMEVERIFY,
    bitcoin.core.opcodes.OP_DROP,
    Buffer.from('${flow.usdtScriptValues.ownerPublicKey}', 'hex'),
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
                          <TimerButton brand onClick={this.confirmBTCScriptChecked}>
                            <FormattedMessage id="EthTokenToUsdt236" defaultMessage="Everything is OK. Continue" />
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
                    <FormattedMessage id="EthTokenToUsdt249" defaultMessage="Not enough money for this swap. Please fund the balance">
                      {message => <h3>{message}</h3> }
                    </FormattedMessage>
                    <div>
                      <div>
                        <FormattedMessage id="EthTokenToUsdt253" defaultMessage="Your balance: " />
                        <strong>{flow.balance}</strong> {this.swap.sellCurrency}
                      </div>
                      <div>
                        <FormattedMessage id="EthTokenToUsdt257" defaultMessage="Required balance: " />
                        <strong>{this.swap.sellAmount.toNumber()}</strong> {this.swap.sellCurrency}
                      </div>
                      <div>
                        <FormattedMessage id="EthTokenToUsdt260" defaultMessage="Your address: " />
                        <a href={`${config.link.usdt}/address/${currencyAddress}`} target="_blank" el="noopener noreferrer">
                          {currencyAddress}
                        </a>
                      </div>
                      <div>
                        <hr />
                        <span>{flow.address}</span>
                      </div>
                      <br />
                      <TimerButton brand onClick={this.updateBalance}>
                        <FormattedMessage id="EthTokenToUsdt267" defaultMessage="Continue" />
                      </TimerButton>
                    </div>
                  </Fragment>
                )
              }
              {
                flow.step === 4 && flow.isBalanceFetching && (
                  <Fragment>
                    <FormattedMessage id="EthTokenToUsdt276" defaultMessage="hecking balance..">
                      {message => <div>{message}</div>}
                    </FormattedMessage>
                    <InlineLoader />
                  </Fragment>
                )
              }
              {
                (flow.step >= 5 || flow.isEthContractFunded) && (
                  <FormattedMessage id="EthTokenToUsdt285" defaultMessage="4. Creating Ethereum Contract. Please wait, it will take a while">
                    {message => <h3>{message}</h3>}
                  </FormattedMessage>
                )
              }
              {
                flow.ethSwapCreationTransactionHash && (
                  <div>
                    <FormattedMessage id="EthTokenToUsdt292" defaultMessage="Transaction: " />
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
                    <FormattedMessage id="EthTokenToUsdt313" defaultMessage="Transaction: " />
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
                    <FormattedMessage id="EthTokenToUsdt331" defaultMessage="5. Waiting BTC Owner adds Secret Key to ETH Contact">
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
                    id="EthTokenToUsdt345"
                    defaultMessage="6. USDT Owner successfully took money from ETH Contract and left Secret Key. Requesting withdrawal from BTC Script. Please wait"
                  >
                    {message => <h3>{message}</h3>}
                  </FormattedMessage>
                )
              }
              {
                flow.usdtSwapWithdrawTransactionHash && (
                  <div>
                    <FormattedMessage id="EthTokenToUsdt352" defaultMessage="USDT withdrawal transaction: " />
                    <strong>
                      <a
                        href={`${config.link.bitpay}/tx/${flow.usdtSwapWithdrawTransactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {flow.usdtSwapWithdrawTransactionHash}
                      </a>
                    </strong>
                    Please note that USDT withdrawal may take a while to mine and to propagate the network.
                    Due to Omni Protocol properties, the transaction may show up at the OmniExplorer in up to 20 minutes.
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
                    <FormattedMessage id="EthTokenToUsdt377" defaultMessage="7. Money was transferred to your wallet. Check the balance.">
                      {message => <h3>{message}</h3>}
                    </FormattedMessage>
                    <FormattedMessage id="EthTokenToUsdt380" defaultMessage="Thank you for using Swap.Online!">
                      {message => <h2>{message}</h2>}
                    </FormattedMessage>
                  </Fragment>
                )
              }
              {
                flow.step >= 6 && !flow.isFinished && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    { enabledButton && !flow.isBtcWithdrawn &&
                    <Button brand onClick={this.tryRefund}>
                      <FormattedMessage id="EthTokenToUsdt390" defaultMessage="TRY REFUND" />
                    </Button>
                    }
                    <Timer
                      lockTime={(flow.usdtScriptValues.lockTime - 5400) * 1000}
                      enabledButton={() => this.setState({ enabledButton: true })}
                    />
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
