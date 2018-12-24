import React, { Component, Fragment } from 'react'

import crypto from 'crypto'
import config from 'app-config'
import { BigNumber } from 'bignumber.js'
import actions from 'redux/actions'

import visaImg from './images/cc-visa-brands.svg'
import masterImg from './images/nodemon.svg'

import CopyToClipboard from 'react-copy-to-clipboard'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import TimerButton from 'components/controls/TimerButton/TimerButton'
import Link from 'sw-valuelink'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'
import QR from 'components/QR/QR'
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
      isAddressCopied: false,
      isPressCtrl: false,
      destinationAddressTimer: true,
      destinationBuyAddress: (this.swap.destinationBuyAddress) ? this.swap.destinationBuyAddress : swapApp.services.auth.accounts.eth.address,
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

  tryRefund = () => {
    this.swap.flow.tryRefund()
    this.setState(() => ({ enabledButton: false }))
  }

  submitSecret = () => {
    const { secret } = this.state

    this.swap.flow.submitSecret(secret)
  }

  confirmAddress = () => {
    this.swap.setDestinationBuyAddress(this.state.destinationBuyAddress)
    this.setState({ destinationAddressTimer : false })
  }

  destinationAddressFocus = () => {
    this.setState({
      destinationAddressTimer: false,
    })
  }

  updateBalance = () => {
    this.swap.flow.syncBalance()
  }

  handleCopyAddress = (e) => {
    this.setState({
      isAddressCopied: true,
    }, () => {
      setTimeout(() => {
        this.setState({
          isAddressCopied: false,
        })
      }, 500)
    })
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

  onCopyAddress = (e) => {
    e.preventDefault()
    this.setState({
      isPressCtrl: true,
    })
  }

  highlightText = (e) => {
    //alert('2')
  }
  handlerBuyWithCreditCard = (e) => {
    e.preventDefault()
  }

  render() {
    const { children } = this.props

    const { currencyAddress, secret, flow, enabledButton, destinationAddressTimer, isAddressCopied } = this.state
    const linked = Link.all(this, 'destinationBuyAddress')
    linked.destinationBuyAddress.check((value) => value !== '', 'Please enter ETH address for tokens')

    return (
      <div className={this.props.styles.swapContainer}>
        {
          this.swap.id && (
            <strong>{this.swap.sellAmount.toNumber()} {this.swap.sellCurrency} &#10230; {this.swap.buyAmount.toNumber()} {this.swap.buyCurrency}</strong>
          )
        }
        {
          flow.isWaitingForOwner && (
            <Fragment>
              <h3>
                <FormattedMessage
                  id="BtcToEthToken77"
                  defaultMessage="We are waiting for a market maker. If it does not appear within 5 minutes, the swap will be canceled automatically." />
              </h3>
              <InlineLoader />
            </Fragment>
          )
        }

        {
          (!flow.isWaitingForOwner && (this.swap.destinationBuyAddress === null)) && (
            <Fragment>
              <FormattedMessage id="BtcToEthTokenAddress1" defaultMessage="Confirm destination address (by default - swap.online wallet)">
                {message => <h3>{message}</h3>}
              </FormattedMessage>
              <Input valueLink={linked.destinationBuyAddress} onFocus={this.destinationAddressFocus} styleName="input" pattern="0-9a-zA-Z" />
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
              <FormattedMessage id="BtcToEthToken87" defaultMessage="Waiting participant confirm this swap">
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
              <FormattedMessage id="BtcToEthToken200" defaultMessage="Create a secret key">
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
                    <div>
                      <FormattedMessage id="BtcToEthToken114" defaultMessage="Save the secret key! Otherwise there will be a chance you loose your money!" />
                    </div>
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
                    <h3>
                      <FormattedMessage id="BtcToEthToken130" defaultMessage="Not enough money for this swap. Please charge the balance" />
                    </h3>
                    <div>
                      <div>
                        <FormattedMessage id="BtcToEthToken134" defaultMessage="Your balance: " />
                        <strong>{flow.balance}</strong>
                        {this.swap.sellCurrency}
                      </div>
                      <div>
                        <FormattedMessage id="BtcToEthToken137" defaultMessage="Required balance: " />
                        <strong>{this.swap.sellAmount.toNumber()}</strong>
                        {this.swap.sellCurrency}
                      </div>
                      <div>
                        <FormattedMessage id="BtcToEthToken140" defaultMessage="Your address: " />
                        <a href={`${config.link.bitpay}/address/${currencyAddress}`} target="_blank" rel="noopener noreferrer">
                          {currencyAddress}
                        </a>
                      </div>
                      <FormattedMessage id="BtcToEthToken134" defaultMessage="Your balance: ">
                        {message => <div>{message}<strong>{flow.balance}</strong> {this.swap.sellCurrency}</div>}
                      </FormattedMessage>
                      <FormattedMessage id="BtcToEthToken137" defaultMessage="Required balance: ">
                        {message => <div>{message}<strong>{this.swap.sellAmount.toNumber()}</strong> {this.swap.sellCurrency}</div>}
                      </FormattedMessage>
                      <FormattedMessage id="BtcToEthToken140" defaultMessage="Your address: ">
                        {message => (
                          <div> {message}
                            {
                              <a href={`${config.link.bitpay}/address/${currencyAddress}`} target="_blank" rel="noopener noreferrer">
                                {currencyAddress}
                              </a>
                            }
                          </div>)}
                      </FormattedMessage>
                      <hr />
                      <span>{flow.address}</span>
                    </div>
                    <br />
                    <TimerButton brand onClick={this.updateBalance}>
                      <FormattedMessage id="BtcToEthToken147" defaultMessage="Continue" />
                    </TimerButton>
                  </Fragment>
                )
              }
              {
                flow.step === 3 && flow.isBalanceFetching && (
                  <Fragment>
                    <div>
                      <FormattedMessage id="BtcToEthToken156" defaultMessage="Checking balance.." />
                    </div>
                    <InlineLoader />
                  </Fragment>
                )
              }

              {
                flow.step === 4 && flow.btcScriptValues && (
                  <div className="swapStep-4">
                    <FormattedMessage id="BtcToEthToken222" defaultMessage="Creating Bitcoin Script. Please wait, it will take a while">
                      {message => <h3>{message}</h3>}
                    </FormattedMessage>
                    {
                      flow.scriptAddress &&
                      <a
                        className={this.props.styles.topUpLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className={this.props.styles.btcMessage}>
                          <FormattedMessage id="BtcToEthToken250" defaultMessage="Copy this address and top up ">
                            {message => <span>{message}</span>}
                          </FormattedMessage>
                          <strong>{this.swap.sellAmount.toNumber()} BTC</strong>
                          <FormattedMessage id="BtcToEthToken251" defaultMessage=" You can send BTC from a wallet of any exchange">
                            {message => <span>{message}</span>}
                          </FormattedMessage>
                        </span>
                        <CopyToClipboard
                          text={flow.scriptAddress}
                          onCopy={this.handleCopyAddress}
                        >
                          <div>
                            <p className={this.props.styles.qr}>
                              <span
                              href={`${config.link.bitpay}/address/${flow.scriptAddress}`}
                              className={this.props.styles.linkAddress}
                              onDoubleClick={this.onCopy}
                              onClick={this.onCopyAddress}>{flow.scriptAddress}
                              </span>
                              <Button
                                styleName="button"
                                brand
                                onClick={() => {}}
                                disabled={isAddressCopied}
                                fullWidth
                              >
                                { isAddressCopied ? <i className="fas fa-copy fa-copy-in" /> : <i className="fas fa-copy" /> }
                              </Button>
                            </p>
                            <b className={this.state.isPressCtrl ? this.props.styles.pressCtrlTextActive : this.props.styles.pressCtrlText}>
                              <FormattedMessage id="BtcToEthToken251" defaultMessage="Press CTRL + C or ⌘ + C to copy the bitcoin address.">
                                {message => <span>{message}</span>}
                              </FormattedMessage>
                            </b>
                          </div>
                        </CopyToClipboard>
                        <div className={this.props.styles.fromClient}>
                          <FormattedMessage id="BtcToEthToken168" defaultMessage="Required balance: ">
                            {message => <span>{message}</span>}
                          </FormattedMessage>
                          {this.swap.sellAmount.toNumber()} BTC
                        </div>
                        <div className={this.props.styles.yourBalance}>
                          <FormattedMessage id="BtcToEthToken169" defaultMessage="Current balance:">
                            {message => <span>{message} </span>}
                          </FormattedMessage>
                          { flow.scriptBalance} BTC
                        </div>
                        <div className={this.props.styles.unconfBalance}>
                          <FormattedMessage id="BtcToEthToken170" defaultMessage="Unconfirmed balance: 0 BTC">
                            {message => <span>{message}</span>}
                          </FormattedMessage>
                          <span className={this.props.styles.lockTime}>
                            <i className="far fa-clock" />
                            <FormattedMessage id="BtcToEthToken336" defaultMessage="You have ">
                              {message => <span>{message}</span>}
                            </FormattedMessage>
                            <span>
                              <Timer
                                lockTime={flow.btcScriptValues.lockTime * 1000}
                              />
                            </span>
                            <FormattedMessage id="BtcToEthToken342" defaultMessage="min for make payment">
                              {message => <span>{message}</span>}
                            </FormattedMessage>
                          </span>
                        </div>
                        <FormattedMessage id="BtcToEthToken171" defaultMessage="Check payment ">
                          {message =>  <Button brand onClick={this.updateBalance}>{message}</Button>}
                        </FormattedMessage>

                        <span className={this.props.styles.swapText}>
                          <FormattedMessage id="BtcToEthToken175" defaultMessage="or">
                            {message => <span>{message}</span>}
                          </FormattedMessage>
                        </span>
                        <p className={this.props.styles.cardsContainer}>
                          <img src={visaImg} alt="" />
                          <img src={masterImg} alt="" />
                        </p>
                        <a
                          onClick={this.handlerBuyWithCreditCard}
                          className={this.props.styles.buyWithCard}
                          href={`https://swap.online/card2card/?addr=${flow.scriptAddress}&amount=${this.swap.sellAmount.toNumber() - flow.balance}`}>
                          <FormattedMessage id="BtcToEthToken173" defaultMessage="Buy with credit card">
                            {message => <span>{message}</span>}
                          </FormattedMessage>
                          <span className={this.props.styles.comingSoon}>
                            <FormattedMessage id="BtcToEthToken180" defaultMessage="Coming soon...">
                              {message => <span>{message}</span>}
                            </FormattedMessage>
                          </span>
                        </a>
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
                  </div>
                )
              }
              {

                // flow.btcScriptValues && !flow.isFinished && !flow.isEthWithdrawn && (
                //   <Fragment>
                //     <br />
                //     { !flow.refundTxHex &&
                //       <Button brand onClick={this.getRefundTxHex}>
                //         <FormattedMessage id="BtcToEthToken200" defaultMessage="Create refund hex" />
                //       </Button>
                //     }
                //     {
                //       flow.refundTxHex && (
                //         <div>
                //           <a href="https://wiki.swap.online/faq/my-swap-got-stuck-and-my-bitcoin-has-been-withdrawn-what-to-do/" target="_blank" rel="noopener noreferrer">
                //             <FormattedMessage id="BtcToEthToken207" defaultMessage="How refund your money? " />
                //           </a>
                //           Refund hex transaction: <code> {flow.refundTxHex} </code>
                //         </div>
                //       )
                //     }
                //   </Fragment>
                // )

              }
              {
                (flow.step === 5 || flow.isEthContractFunded) && (
                  <Fragment>
                    <FormattedMessage id="BtcToEthToken230" defaultMessage="ETH Owner received Bitcoin Script and Secret Hash. Waiting when he creates ETH Contract">
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
                  <FormattedMessage id="BtcToEthToken260" defaultMessage="ETH Contract created and charged. Requesting withdrawal from ETH Contract. Please wait">
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
                    <FormattedMessage id="BtcToEthToken290" defaultMessage="Money was transferred to your wallet. Check the balance.">
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
