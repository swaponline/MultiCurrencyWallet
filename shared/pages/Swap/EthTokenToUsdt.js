import React, { Component, Fragment } from 'react'

import config from 'app-config'
import { BigNumber } from 'bignumber.js'

import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import TimerButton from 'components/controls/TimerButton/TimerButton'
import Button from 'components/controls/Button/Button'
import Timer from './Timer/Timer'
import { FormattedMessage } from 'react-intl'


export default class EthTokenToUSDTomni extends Component {

  constructor({ swap, currencyData }) {
    super()

    this.swap = swap

    this.state = {
      currencyAddress: currencyData.address,
      flow: this.swap.flow.state,
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
          flow.isWaitingForOwner && (
            <Fragment>
              <h3>
                <FormattedMessage id="EthTokenToUSDTomni84" defaultMessage="Waiting for other user when he connect to the order" />
              </h3>
              <InlineLoader />
            </Fragment>
          )
        }
        {
          (flow.step === 1 || flow.isMeSigned) && (
            <h3>
              <FormattedMessage id="EthTokenToUSDTomni93" defaultMessage="1. Please confirm your participation to begin the deal" />
            </h3>
          )
        }
        {
          flow.step === 1 && (
            <Fragment>
              <div>
                <FormattedMessage
                  id="EthTokenToUSDTomni101"
                  defaultMessage=
                  "Confirmation of the transaction is necessary for crediting the reputation. If a user does not bring the deal to the end he gets a negative credit to his reputation." // eslint-disable-line
                />
              </div>

              {
                !flow.isSignFetching && !flow.isMeSigned && (
                  <Fragment>
                    <br />
                    <TimerButton disabledTimer={disabledTimer} brand onClick={this.signSwap}>
                      <FormattedMessage id="EthTokenToUSDTomni109" defaultMessage="Confirm" />
                    </TimerButton>
                  </Fragment>
                )
              }
              {
                (flow.isSignFetching || flow.signTransactionHash) && (
                  <Fragment>
                    <h4>
                      <FormattedMessage id="EthTokenToUSDTomni118" defaultMessage="Please wait. Confirmation processing" />
                    </h4>
                    {
                      flow.signTransactionHash && (
                        <div>
                          <FormattedMessage id="EthTokenToUSDTomni123" defaultMessage="Transaction: " />
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
              <h3>
                <FormattedMessage id="EthTokenToUSDTomni154" defaultMessage="2. Waiting for USDTomni Owner to create a Secret Key, create BTC Omni Script and charge it" />
              </h3>
              {
                flow.step === 2 && (
                  <InlineLoader />
                )
              }

              {
                flow.secretHash && flow.USDTomniScriptValues && (
                  <Fragment>
                    <h3>
                      <FormattedMessage id="EthTokenToUSDTomni166" defaultMessage="3. Bitcoin Omni Script created and charged. Please check the information below" />
                    </h3>
                    <div>
                      <FormattedMessage id="EthTokenToUSDTomni169" defaultMessage="Secret Hash: " />
                      <strong>{flow.secretHash}</strong>
                    </div>
                    <div>
                      <FormattedMessage id="EthTokenToUSDTomni172" defaultMessage="Script address: " />
                      <strong>
                        {
                          flow.USDTomniFundingTransactionHash && (
                            <a
                              href={`${config.link.bitpay}/tx/${flow.USDTomniFundingTransactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {flow.USDTomniFundingTransactionHash}
                            </a>
                          )
                        }
                      </strong>
                    </div>
                    <br />
                    <Fragment>
                      { flow.USDTomniScriptValues &&
                        <span onClick={this.toggleBitcoinScript}>
                          <FormattedMessage id="EthTokenToUSDTomni192" defaultMessage="Show bitcoin script " />
                        </span>
                      }
                      { isShowingBitcoinScript && (
                        <pre>
                          <code>{`
  bitcoinjs.script.compile([
    bitcoin.core.opcodes.OP_RIPEMD160,
    Buffer.from('${flow.USDTomniScriptValues.secretHash}', 'hex'),
    bitcoin.core.opcodes.OP_EQUALVERIFY,

    Buffer.from('${flow.USDTomniScriptValues.recipientPublicKey}', 'hex'),
    bitcoin.core.opcodes.OP_EQUAL,
    bitcoin.core.opcodes.OP_IF,

    Buffer.from('${flow.USDTomniScriptValues.recipientPublicKey}', 'hex'),
    bitcoin.core.opcodes.OP_CHECKSIG,

    bitcoin.core.opcodes.OP_ELSE,

    bitcoin.core.script.number.encode(${flow.USDTomniScriptValues.lockTime}),
    bitcoin.core.opcodes.OP_CHECKLOCKTIMEVERIFY,
    bitcoin.core.opcodes.OP_DROP,
    Buffer.from('${flow.USDTomniScriptValues.ownerPublicKey}', 'hex'),
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
                          <TimerButton disabledTimer={disabledTimer} brand onClick={this.confirmBTCScriptChecked}>
                            <FormattedMessage id="EthTokenToUSDTomni236" defaultMessage="Everything is OK. Continue" />
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
                      <FormattedMessage id="EthTokenToUSDTomni249" defaultMessage="Not enough money for this swap. Please fund the balance" />
                    </h3>
                    <div>
                      <div>
                        <FormattedMessage id="EthTokenToUSDTomni253" defaultMessage="Your balance: " />
                        <strong>{flow.balance}</strong> {this.swap.sellCurrency}
                      </div>
                      <div>
                        <FormattedMessage id="EthTokenToUSDTomni257" defaultMessage="Required balance: " />
                        <strong>{this.swap.sellAmount.toNumber()}</strong> {this.swap.sellCurrency}
                      </div>
                      <div>
                        <FormattedMessage id="EthTokenToUSDTomni260" defaultMessage="Your address: " />
                        <a href={`${config.link.USDTomni}/address/${currencyAddress}`} target="_blank" el="noopener noreferrer">
                          {currencyAddress}
                        </a>
                      </div>
                      <div>
                        <hr />
                        <span>{flow.address}</span>
                      </div>
                      <br />
                      <TimerButton disabledTimer={disabledTimer} brand onClick={this.updateBalance}>
                        <FormattedMessage id="EthTokenToUSDTomni267" defaultMessage="Continue" />
                      </TimerButton>
                    </div>
                  </Fragment>
                )
              }
              {
                flow.step === 4 && flow.isBalanceFetching && (
                  <Fragment>
                    <div>
                      <FormattedMessage id="EthTokenToUSDTomni276" defaultMessage="hecking balance.." />
                    </div>
                    <InlineLoader />
                  </Fragment>
                )
              }
              {
                (flow.step >= 5 || flow.isEthContractFunded) && (
                  <h3>
                    <FormattedMessage id="EthTokenToUSDTomni285" defaultMessage="4. Creating Ethereum Contract.{br}Please wait, it can take a few minutes" values={{ br: <br /> }} />
                  </h3>
                )
              }
              {
                flow.ethSwapCreationTransactionHash && (
                  <div>
                    <FormattedMessage id="EthTokenToUSDTomni292" defaultMessage="Transaction: " />
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
                    <FormattedMessage id="EthTokenToUSDTomni313" defaultMessage="Transaction: " />
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
                    <h3>
                      <FormattedMessage id="EthTokenToUSDTomni331" defaultMessage="5. Waiting for BTC Owner to add a Secret Key to ETH Contact" />
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
                (flow.step === 7 || flow.isBtcWithdrawn) && (
                  <h3>
                    <FormattedMessage
                      id="EthTokenToUSDTomni345"
                      defaultMessage="6. USDTomni Owner successfully took money from ETH Contract and left Secret Key. Requesting withdrawal from BTC Script. Please wait"
                    />
                  </h3>
                )
              }
              {
                flow.USDTomniSwapWithdrawTransactionHash && (
                  <div>
                    <FormattedMessage id="EthTokenToUSDTomni352" defaultMessage="USDTomni withdrawal transaction: " />
                    <strong>
                      <a
                        href={`${config.link.bitpay}/tx/${flow.USDTomniSwapWithdrawTransactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {flow.USDTomniSwapWithdrawTransactionHash}
                      </a>
                    </strong>
                    <FormattedMessage
                      id="EthTokenToUSDTomni375"
                      defaultMessage="Please note that USDTomni withdrawal may take a while to mine and to propagate the network. Due to Omni Protocol properties, the transaction may show up at the OmniExplorer in up to 20 minutes."
                    />
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
                      <FormattedMessage id="EthTokenToUSDTomni377" defaultMessage="7. USDTomni was transferred to your wallet. Check the balance." />
                    </h3>
                    <h2>
                      <FormattedMessage id="EthTokenToUSDTomni380" defaultMessage="Thank you for using Swap.Online!" />
                    </h2>
                  </Fragment>
                )
              }
              {
                flow.step >= 6 && !flow.isFinished && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    { enabledButton && !flow.isBtcWithdrawn &&
                    <Button brand onClick={this.tryRefund}>
                      <FormattedMessage id="EthTokenToUSDTomni390" defaultMessage="TRY REFUND" />
                    </Button>
                    }
                    <Timer
                      lockTime={(flow.USDTomniScriptValues.lockTime - 5400) * 1000}
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
