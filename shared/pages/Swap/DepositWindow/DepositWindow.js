import React, { Fragment, Component } from 'react'

import config from 'app-config'
import { connect } from 'redaction'
import actions from 'redux/actions'
import helpers, { constants } from 'helpers'
import reducers from 'redux/core/reducers'

import CSSModules from 'react-css-modules'
import styles from '../Swap.scss'

import { BigNumber } from 'bignumber.js'

import { FormattedMessage } from 'react-intl'
import CopyToClipboard from 'react-copy-to-clipboard'
import PropTypes from 'prop-types'
import ReactTooltip from 'react-tooltip'

import Button from 'components/controls/Button/Button'
import QR from 'components/QR/QR'
import Timer from '../Timer/Timer'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import coinsWithDynamicFee from 'helpers/constants/coinsWithDynamicFee'


@CSSModules(styles)
export default class DepositWindow extends Component {

  constructor({ swap, flow, onCopyAddress, currencyData }) {
    super()

    this.swap = swap

    this.state = {
      swap,
      dynamicFee: 0,
      remainingBalance: this.swap.sellAmount,
      flow: swap.flow.state,
      isBalanceEnough: false,
      isAddressCopied: false,
      isBalanceFetching: false,
      scriptAddress: flow.scriptAddress,
      scriptBalance: flow.scriptBalance,
      balance: this.isDepositToContractDirectly() ? flow.scriptBalance : flow.balance,
      address: this.isDepositToContractDirectly() ? flow.scriptAddress : currencyData.address,
      currencyFullName: currencyData.fullName,
      sellAmount: this.swap.sellAmount,
    }
  }

  componentDidMount() {
    const { swap } =  this.props
    const { sellAmount, scriptBalance, balance } = this.state

    let checker
    this.getRequiredAmount()
    this.updateRemainingBalance()

    const availableBalance = this.isDepositToContractDirectly() ? scriptBalance : balance

    checker = setInterval(() => {
      if (BigNumber(availableBalance).isLessThanOrEqualTo(sellAmount)) {
        this.updateBalance()
        this.checkThePayment()
      } else {
        clearInterval(checker)
      }
    }, 5000)
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.balance !== prevState.balance) {
      this.updateRemainingBalance()
    }
  }

  isDepositToContractDirectly = () => this.swap.sellCurrency === 'BTC'

  updateBalance = async () => {
    const { swap } =  this.props
    const { sellAmount, scriptBalance, address, scriptAddress } =  this.state

    if (helpers.ethToken.isEthToken({ name: swap.sellCurrency.toLowerCase() })) {
      const currencyBalance = await actions.token.getBalance(swap.sellCurrency.toLowerCase())
      this.setState(() => ({ currencyBalance }))
    } else {
      const currencyBalance = await actions[swap.sellCurrency.toLowerCase()].getBalance()
      this.setState(() => ({ currencyBalance }))
    }

    const actualBalance = this.isDepositToContractDirectly() ? scriptBalance : (this.state.currencyBalance || 0)

    this.setState(() => ({
      balance: actualBalance,
      scriptBalance: swap.flow.state.scriptBalance,
      address: this.isDepositToContractDirectly() ? scriptAddress : address,
    }))
  }

  updateRemainingBalance = async () => {
    const { swap } = this.props
    const { sellAmount, balance, dynamicFee } = this.state

    const remainingBalance = new BigNumber(sellAmount).minus(balance).plus(dynamicFee).dp(6, BigNumber.ROUND_HALF_CEIL)

    this.setState(() => ({
      remainingBalance,
      dynamicFee,
    }))
  }

  getRequiredAmount = async () => {
    const { swap } =  this.props
    const { sellAmount } = this.state

    if (!coinsWithDynamicFee.includes(swap.sellCurrency.toLowerCase()) || this.isDepositToContractDirectly()) {
      this.setState({
        dynamicFee: BigNumber(0),
        requiredAmount: BigNumber(sellAmount).dp(6, BigNumber.ROUND_HALF_CEIL),
      })
    } else {
      const dynamicFee = await helpers[swap.sellCurrency.toLowerCase()].estimateFeeValue({ method: 'swap', fixed: true })

      const requiredAmount = BigNumber(sellAmount).plus(dynamicFee).dp(6, BigNumber.ROUND_HALF_CEIL)

      this.setState(() => ({
        dynamicFee,
        requiredAmount,
      }))
    }

    this.updateRemainingBalance()
  }

  checkThePayment = () => {
    if (this.state.sellAmount <= this.state.balance) {
      this.setState(() => ({
        isBalanceEnough: true,
      }))
    }
  }

  onCopyAddress = (e) => {
    // e.preventDefault()
    this.setState({
      isPressCtrl: true,
    })
  }

  handleReloadBalance = async () => {
    const { isBalanceFetching } = this.state

    this.updateBalance()

    this.setState({
      isBalanceFetching: true,
    }, () => {
      setTimeout(() => {
        this.setState({
          isBalanceFetching: false,
        })
      }, 500)
    })
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

  handlerBuyWithCreditCard = (e) => {
    e.preventDefault()
  }

  render() {
    const {
      swap,
      flow,
      balance,
      address,
      dynamicFee,
      sellAmount,
      isPressCtrl,
      flowBalance,
      requiredAmount,
      missingBalance,
      isAddressCopied,
      isBalanceEnough,
      currencyFullName,
      remainingBalance,
      isBalanceFetching,
    } = this.state

    const isWidgetBuild = config && config.isWidget

    const DontHaveEnoughtFoundsValues = {
      missingBalance:
  <div>
    {remainingBalance > 0 ?
      <strong>{`${remainingBalance}`} {swap.sellCurrency}{'  '}</strong>
      :
      <span styleName="loaderHolder">
        <InlineLoader />
      </span>
    }
    <Tooltip id="dep170">
      <div>
        {/* eslint-disable */}
        <FormattedMessage
          id="deposit177"
          defaultMessage="Do not top up the contract with the greater amount than recommended. The remaining balance will be send to the counter party. You can send {tokenName} from a wallet of any exchange"
          values={{
            amount: `${swap.sellAmount}`,
            tokenName: swap.sellCurrency,
            br: <br />,
          }}
        />
        {/* eslint-enable */}
        {/* <p>
          <FormattedMessage id="deposit181" defaultMessage="You can send {currency} from a wallet of any exchange" values={{ currency: `${swap.buyCurrency}` }} />
        </p> */}
      </div>
    </Tooltip>
  </div>,
      amount: `${swap.sellAmount}`,
      tokenName: swap.sellCurrency,
      br: <br />,
    }

    const balanceToRender = BigNumber(balance).dp(6, BigNumber.ROUND_HALF_CEIL)

    return (
      <Fragment>
        <div
          styleName="topUpLink"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div styleName="top">
            <div styleName="btcMessage">
              {/* eslint-disable */}
              {isWidgetBuild ? (
                <FormattedMessage
                  id="deposit165widget"
                  defaultMessage="Copy the address below and top it up with the recommended amount of {missingBalance} "
                  values={DontHaveEnoughtFoundsValues}
                />
              ) : (
                <FormattedMessage
                  id="deposit165"
                  defaultMessage="You don't have enought funds to continue the swap. Copy the address below and top it up with the recommended amount of {missingBalance} "
                  values={DontHaveEnoughtFoundsValues}
                />
              )}
              {/* eslint-enable */}
            </div>
            <div styleName="qrImg">
              <QR
                network={currencyFullName.toLowerCase()}
                address={`${address}?amount=${remainingBalance}`}
                size={160}
              />
            </div>
          </div>
          <CopyToClipboard
            text={address}
            onCopy={this.onCopyAddress}
          >
            <div>
              <a styleName="linkText">
                <FormattedMessage
                  id="deposit256"
                  defaultMessage="The address of {tokenName} smart contract "
                  values={{
                    tokenName: swap.sellCurrency,
                  }}
                />
              </a>
              <div styleName="linkTransactions">
                <strong>
                  <a
                    href={swap.sellCurrency === 'BTC'
                      ? `${config.link.bitpay}/address/${address}`
                      : `${config.link.etherscan}/address/${address}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FormattedMessage id="deposit297" defaultMessage="link to explorer" />
                  </a>
                </strong>
              </div>
              <p styleName="qr">
                <a
                  styleName="linkAddress"
                  onDoubleClick={this.onCopy}
                  onClick={this.onCopyAddress}
                >
                  {address}
                </a>
                <Button
                  brand
                  disabled={isAddressCopied}
                  fullWidth
                >
                  <span className="copyText">copy</span>
                  {isAddressCopied ? <i className="fas fa-copy fa-copy-in" /> : <i className="fas fa-copy" />}
                </Button>
              </p>
            </div>
          </CopyToClipboard>
          <div>
            <i className="fas fa-sync-alt" styleName="icon" onClick={this.handleReloadBalance} />
            {/* eslint-disable */}
            {isBalanceFetching
              ? (
                <a styleName="loaderHolder">
                  <InlineLoader />
                </a>
              ) : (
                <FormattedMessage
                  id="deposit300"
                  defaultMessage="Received {balance} / {need} {tooltip}"
                  values={{
                    br: <br />,
                    balance: <strong>{`${balanceToRender}`} {swap.sellCurrency}{'  '}</strong>,
                    need: <strong>{`${requiredAmount}`} {swap.sellCurrency}</strong>,
                    tooltip:
                      <Tooltip id="dep226">
                        <FormattedMessage
                          id="deposit239"
                          defaultMessage="Swap will continue after {tokenName} contract receives the funds. Is usually takes less than 10 min"
                          values={{
                            tokenName: swap.sellCurrency,
                            br: <br />
                          }}
                        />
                      </Tooltip>
                  }}
                />
              )}
              {isBalanceEnough
                ? <FormattedMessage id="deposit198.1" defaultMessage="create Ethereum Contract.{br}Please wait, it can take a few minutes..." values={{ br: <br /> }} />
                : <FormattedMessage id="deposit198" defaultMessage="waiting for payment..." />
              }
              <a styleName="loaderHolder">
                <InlineLoader />
              </a>
              {dynamicFee > 0 &&
              <a styleName="included">
                <FormattedMessage
                  id="deposit320"
                  defaultMessage="(included {mineerFee} {sellCurrency} miners fee) "
                  values={{
                    mineerFee: dynamicFee,
                    sellCurrency: swap.sellCurrency,
                  }}
                />
              </a>}
              <div>
            </div>
            {/* eslint-enable */}
          </div>
          {flow.btcScriptValues !== null &&
          <div styleName="lockTime">
            <i className="far fa-clock" />
            <FormattedMessage
              id="Deposit52"
              defaultMessage="You have {timer} min to make the payment"
              values={{ timer: <Timer lockTime={flow.btcScriptValues.lockTime * 1000} defaultMessage={false} /> }} />
          </div>}
        </div>
      </Fragment>
    )
  }

}
