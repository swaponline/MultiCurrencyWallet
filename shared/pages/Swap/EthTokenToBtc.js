import React, { Component, Fragment } from 'react'

import config from 'app-config'
import { BigNumber } from 'bignumber.js'

import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import TimerButton from 'components/controls/TimerButton/TimerButton'
import Button from 'components/controls/Button/Button'
import Timer from './Timer/Timer'
import { FormattedMessage } from 'react-intl'


export default class EthTokenToBtc extends Component {

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
  }

  toggleBitcoinScript = () => {
    this.setState({
      isShowingBitcoinScript: !this.state.isShowingBitcoinScript,
    })
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
              <FormattedMessage id="EthTokenBtc77" defaultMessage="Waiting for other user when he connect to the order">
                {message => <h3>{message}</h3>}
              </FormattedMessage>
              <InlineLoader />
            </Fragment>
          )
        }
        {
          (flow.step === 1 || flow.isMeSigned) && (
            <FormattedMessage id="EthTokenBtc86" defaultMessage="1. Please confirm your participation to begin the deal">
              {message => <h3>{message}</h3>}
            </FormattedMessage>
          )
        }
        {
          flow.step === 1 && (
            <Fragment>
              <FormattedMessage
                id="EthTokenBtc94"
                defaultMessage=
                  "Confirmation of the transaction is necessary for crediting the reputation.If a user does not bring the deal to the end he gets a negative reputation."
              >
                {message => <div>{message}</div>}
              </FormattedMessage>
              {
                !flow.isSignFetching && !flow.isMeSigned && (
                  <Fragment>
                    <br />
                    <TimerButton timeLeft={5} brand onClick={this.signSwap}>
                      <FormattedMessage id="EthTokenBtc102" defaultMessage="Confirm" />
                    </TimerButton>
                  </Fragment>
                )
              }
              {
                (flow.isSignFetching || flow.signTransactionHash) && (
                  <Fragment>
                    <FormattedMessage id="EthTokenBtc111" defaultMessage="Please wait. Confirmation processing">
                      {message => <h4>{message}</h4>}
                    </FormattedMessage>
                    {
                      flow.signTransactionHash && (
                        <div>
                          <FormattedMessage id="EthTokenBtc116" defaultMessage="Transaction: " />
                          <strong>
                            <a href={`${config.link.etherscan}/tx/${flow.signTransactionHash}`} target="_blank" rel="noopener noreferrer" >{flow.signTransactionHash}</a>
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
              <FormattedMessage id="EthTokenBtc147" defaultMessage="2. Waiting BTC Owner creates Secret Key, creates BTC Script and charges it">
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
                    <FormattedMessage id="EthTokenBtc159" defaultMessage="3. Bitcoin Script created and charged. Please check the information below">
                      {message => <h3>{message}</h3>}
                    </FormattedMessage>
                    <div>
                      <FormattedMessage id="EthTokenBtc162" defaultMessage="Secret Hash: " />
                      <strong>{flow.secretHash}</strong>
                    </div>
                    <div>
                      <FormattedMessage id="EthTokenBtc165" defaultMessage="Script address: " />
                      <strong>
                        {flow.btcScriptCreatingTransactionHash && (
                          <a
                            href={`${config.link.bitpay}/tx/${flow.btcScriptCreatingTransactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer" >
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
                          <FormattedMessage id="EthTokenBtc184" defaultMessage="Show bitcoin script " />
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
                            <FormattedMessage id="EthTokenBtc228" defaultMessage="Everything is OK. Continue" />
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
                    <FormattedMessage id="EthTokenBtc241" defaultMessage="Not enough money for this swap. Please fund the balance">
                      {message => <h3>{message} </h3>}
                    </FormattedMessage>
                    <div>
                      <FormattedMessage id="EthTokenBtc245" defaultMessage="Your balance: ">
                        {message => <div>{message}<strong>{flow.balance}</strong> {this.swap.sellCurrency}</div>}
                      </FormattedMessage>
                      <FormattedMessage id="EthTokenBtc248" defaultMessage="Required balance: " >
                        {message => <div>{message}<strong>{this.swap.sellAmount.toNumber()}</strong> {this.swap.sellCurrency}</div>}
                      </FormattedMessage>
                      <FormattedMessage id="EthTokenBtc251" defaultMessage="Your address: ">
                        {message => <div>{message}{
                          <a href={`${config.link.etherscan}/address/${currencyAddress}`} target="_blank" el="noopener noreferrer">
                            {currencyAddress}
                          </a>
                        }</div>}
                      </FormattedMessage>
                      <hr />
                      <span>{flow.address}</span>
                    </div>
                    <br />
                    <FormattedMessage id="EthTokenBtc258" defaultMessage="Continue" >
                      {message => <TimerButton brand onClick={this.updateBalance}>{message}</TimerButton>}
                    </FormattedMessage>
                  </Fragment>
                )
              }
              {
                flow.step === 4 && flow.isBalanceFetching && (
                  <Fragment>
                    <FormattedMessage id="EthTokenBtc267" defaultMessage="Checking balance..">
                      {message => <div>{message}</div>}
                    </FormattedMessage>
                    <InlineLoader />
                  </Fragment>
                )
              }
              {
                (flow.step >= 5 || flow.isEthContractFunded) && (
                  <FormattedMessage id="EthTokenBtc276" defaultMessage="4. Creating Ethereum Contract. Please wait, it will take a while">
                    {message => <h3>{message}</h3>}
                  </FormattedMessage>
                )
              }
              {
                flow.ethSwapCreationTransactionHash && (
                  <div>
                    <FormattedMessage id="EthTokenBtc283" defaultMessage="Transaction: " />
                    <strong>
                      <a
                        href={`${config.link.etherscan}/tx/${flow.ethSwapCreationTransactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer">{flow.ethSwapCreationTransactionHash}
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
                    <FormattedMessage id="EthTokenBtc303" defaultMessage="Transaction: " />
                    <strong>
                      <a href={`${config.link.etherscan}/tx/${flow.refundTransactionHash}`} target="_blank" rel="noopener noreferrer">
                        {flow.refundTransactionHash}
                      </a>
                    </strong>
                  </div>
                )
              }

              {
                (flow.step === 6 || flow.isEthWithdrawn) && (
                  <Fragment>
                    <FormattedMessage id="EthTokenBtc321" defaultMessage="5. Waiting BTC Owner adds Secret Key to ETH Contact">
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
                    id="EthTokenBtc335"
                    defaultMessage="6. BTC Owner successfully took money from ETH Contract and left Secret Key. Requesting withdrawal from BTC Script. Please wait">
                    {message => <h3>{message}</h3>}
                  </FormattedMessage>
                )
              }
              {
                flow.btcSwapWithdrawTransactionHash && (
                  <div>
                    <FormattedMessage id="EthTokenBtc342" defaultMessage="Transaction: " />
                    <strong>
                      <a href={`${config.link.bitpay}/tx/${flow.btcSwapWithdrawTransactionHash}`} target="_blank" rel="noopener noreferrer">
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
                    <FormattedMessage id="EthTokenBtc365" defaultMessage="Thank you for using Swap.Online!">
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
                        <FormattedMessage id="EthTokenBtc375" defaultMessage="TRY REFUND" />
                      </Button>
                    }
                    <div>
                      <Timer lockTime={(flow.btcScriptValues.lockTime - 5400) * 1000} enabledButton={() => this.setState({ enabledButton: true })} />
                    </div>
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
