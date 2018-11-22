import React, { Component, Fragment } from 'react'

import crypto from 'crypto'
import config from 'app-config'
import { BigNumber } from 'bignumber.js'

import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import TimerButton from 'components/controls/TimerButton/TimerButton'
import Link from 'sw-valuelink'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'
import swapApp from 'swap.app'
import Timer from './Timer/Timer'
import { FormattedMessage } from 'react-intl'


export default class BtcToEthToken extends Component {

  constructor({ swap, currencyData }) {
    super()

    this.swap = swap

    this.state = {
      currencyAddress: currencyData.address,
      flow: this.swap.flow.state,
      secret: crypto.randomBytes(32).toString('hex'),
      enabledButton: false,
      destinationAddressTimer: true,
      destinationBuyAddress: (this.swap.destinationBuyAddress) ? this.swap.destinationBuyAddress : swapApp.services.auth.accounts.eth.address
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

  confirmAddress = () => {
    this.swap.setDestinationBuyAddress(this.state.destinationBuyAddress);
    this.setState( { destinationAddressTimer : false } );
  }

  destinationAddressFocus = () => {
    this.setState( {
      destinationAddressTimer: false
    } );
  }

  updateBalance = () => {
    this.swap.flow.syncBalance()
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

    const { currencyAddress, secret, flow, enabledButton, destinationAddressTimer } = this.state
    const linked = Link.all(this, 'destinationBuyAddress')

    linked.destinationBuyAddress.check((value) => value !== '', 'Please enter ETH address for tokens')

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
                id="BtcToEthToken77"
                defaultMessage="We are waiting for a market maker. If it does not appear within 5 minutes, the swap will be canceled automatically.">
                {message => <h3>{message}</h3>}
              </FormattedMessage>
              <InlineLoader />
            </Fragment>
          )
        }

        {
          (!flow.isWaitingForOwner && (this.swap.destinationBuyAddress===null)) && (
          <Fragment>
            <FormattedMessage id="BtcToEthTokenAddress1" defaultMessage="Confirm destination address (by default - swap.online wallet)">
              {message => <h3>{message}</h3>}
            </FormattedMessage>
            <Input valueLink={linked.destinationBuyAddress} onFocus={this.destinationAddressFocus} styleName="input" pattern="0-9a-zA-Z" />
            <hr />
            { destinationAddressTimer && (
              <TimerButton timeLeft={10} brand onClick={this.confirmAddress}>
                <FormattedMessage id="BtcToEthTokenAddress2" defaultMessage="Confirm address " />
              </TimerButton>
            ) }
            { !destinationAddressTimer && (
              <Button brand onClick={this.confirmAddress} styleName="button"> 
                <FormattedMessage id="BtcToEthTokenAddress2" defaultMessage="Confirm address" />
              </Button>
            ) }
          </Fragment>
          )
        }

        {
          (this.swap.destinationBuyAddress && (flow.step === 1 || flow.isMeSigned)) && (
            <Fragment>
              <FormattedMessage id="BtcToEthToken87" defaultMessage="1. Waiting participant confirm this swap">
                {message => <h3>{message}</h3>}
              </FormattedMessage>
              <InlineLoader />
            </Fragment>
          )
        }

        {/* ----------------------------------------------------------- */}

        {
          flow.isParticipantSigned && this.swap.destinationBuyAddress && (
            <Fragment>
              <FormattedMessage id="BtcToEthToken100" defaultMessage="2. Create a secret key">
                {message => <h3>{message}</h3>}
              </FormattedMessage>
              {
                !flow.secretHash ? (
                  <Fragment>
                    <input type="text" placeholder="Secret Key" defaultValue={secret} />
                    <br />
                    <TimerButton timeLeft={5} brand onClick={this.submitSecret}>
                      <FormattedMessage id="BtcToEthToken108" defaultMessage="Confirm" />
                    </TimerButton>
                  </Fragment>
                ) : (
                  <Fragment>
                    <FormattedMessage id="BtcToEthToken114" defaultMessage="Save the secret key! Otherwise there will be a chance you loose your money!">
                      {message => <div>{message}</div>}
                    </FormattedMessage>
                    <div>
                      <FormattedMessage id="BtcToEthToken117" defaultMessage="Secret Key: " />
                      <strong>{flow.secret}</strong>
                    </div>
                    <div>
                      <FormattedMessage id="BtcToEthToken120" defaultMessage="Secret Hash: " />
                      <strong>{flow.secretHash}</strong>
                    </div>
                  </Fragment>
                )
              }

              {
                flow.step === 3 && !flow.isBalanceEnough && !flow.isBalanceFetching && (
                  <Fragment>
                    <FormattedMessage id="BtcToEthToken130" defaultMessage="Not enough money for this swap. Please charge the balance">
                      {message => <h3>{message}</h3>}
                    </FormattedMessage>
                    <div>
                      <FormattedMessage id="BtcToEthToken134" defaultMessage="Your balance: ">
                        {message => <div>{message}<strong>{flow.balance}</strong> {this.swap.sellCurrency}</div>}
                      </FormattedMessage>
                      <FormattedMessage id="BtcToEthToken137" defaultMessage="Required balance: ">
                        {message => <div>{message}<strong>{this.swap.sellAmount.toNumber()}</strong> {this.swap.sellCurrency}</div>}
                      </FormattedMessage>
                      <FormattedMessage id="BtcToEthToken140" defaultMessage="Your address: ">
                        {message => <div>{message}{
                           <a href={`${config.link.bitpay}/address/${currencyAddress}`} target="_blank" el="noopener noreferrer">
                             {currencyAddress}
                           </a>
                        }</div>}
                      </FormattedMessage>
                      <hr />
                      <span>{flow.address}</span>
                    </div>
                    <br />
                    <FormattedMessage id="BtcToEthToken147" defaultMessage="Continue">
                      {message =>  <TimerButton brand onClick={this.updateBalance}>{message}</TimerButton>}
                    </FormattedMessage>
                  </Fragment>
                )
              }
              {
                flow.step === 3 && flow.isBalanceFetching && (
                  <Fragment>
                    <FormattedMessage id="BtcToEthToken156" defaultMessage="Checking balance..">
                      {message => <div>{message}</div>}
                    </FormattedMessage>
                    <InlineLoader />
                  </Fragment>
                )
              }

              {
                flow.step === 4 && flow.btcScriptValues && (
                  <Fragment>
                    <FormattedMessage id="BtcToEthToken167" defaultMessage="3. Creating Bitcoin Script. Please wait, it will take a while">
                      {message => <h3>{message}</h3>}
                    </FormattedMessage>
                    {
                      flow.scriptAddress &&
                      <a
                        href={`${config.link.bitpay}/address/${flow.scriptAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Top up BTC Script {flow.scriptAddress}
                      </a>
                    }
                    {
                      flow.btcScriptCreatingTransactionHash && (
                        <div>
                          <FormattedMessage id="BtcToEthToken172" defaultMessage="Transaction: " />
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
                flow.btcScriptValues && !flow.isFinished && !flow.isEthWithdrawn && (
                  <Fragment>
                    <br />
                    { !flow.refundTxHex &&
                      <Button brand onClick={this.getRefundTxHex}>
                        <FormattedMessage id="BtcToEthToken200" defaultMessage="Create refund hex" />
                      </Button>
                    }
                    {
                      flow.refundTxHex && (
                        <div>
                          <a href="https://wiki.swap.online/faq/my-swap-got-stuck-and-my-bitcoin-has-been-withdrawn-what-to-do/" target="_blank" rel="noopener noreferrer">
                            <FormattedMessage id="BtcToEthToken207" defaultMessage="How refund your money? " />
                          </a>
                          Refund hex transaction: <code> {flow.refundTxHex} </code>
                        </div>
                      )
                    }
                  </Fragment>
                )
              }
              {
                (flow.step === 5 || flow.isEthContractFunded) && (
                  <Fragment>
                    <FormattedMessage id="BtcToEthToken230" defaultMessage="4. ETH Owner received Bitcoin Script and Secret Hash. Waiting when he creates ETH Contract">
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
                    <FormattedMessage id="BtcToEthToken243" defaultMessage="Transaction: " />
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
                  <FormattedMessage id="BtcToEthToken260" defaultMessage="5. ETH Contract created and charged. Requesting withdrawal from ETH Contract. Please wait">
                    {message => <h3>{message}</h3>}
                  </FormattedMessage>
                )
              }
              {
                flow.ethSwapWithdrawTransactionHash && (
                  <div>
                    <FormattedMessage id="BtcToEthToken267" defaultMessage="Transaction: " />
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
                    <FormattedMessage id="BtcToEthToken290" defaultMessage="6. Money was transferred to your wallet. Check the balance.">
                      {message => <h3>{message}</h3>}
                    </FormattedMessage>
                    <FormattedMessage id="BtcToEthToken293" defaultMessage="Thank you for using Swap.Online!">
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
                        <FormattedMessage id="BtcToEthToken303" defaultMessage="TRY REFUND" />
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
                    <FormattedMessage id="BtcToEthToken316" defaultMessage="Transaction: " />
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
