import React, { Fragment, Component } from 'react'

import config from 'app-config'
import { connect } from 'redaction'
import actions from 'redux/actions'
import helpers, { constants } from 'helpers'
import reducers from 'redux/core/reducers'

import CSSModules from 'react-css-modules'
import styles from '../../Swap.scss'

import { BigNumber } from 'bignumber.js'

import { FormattedMessage } from 'react-intl'
import CopyToClipboard from 'react-copy-to-clipboard'
import PropTypes from 'prop-types'
import ReactTooltip from 'react-tooltip'

import Button from 'components/controls/Button/Button'
import QR from 'components/QR/QR'
import Timer from '../../Timer/Timer'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import coinsWithDynamicFee from 'helpers/constants/coinsWithDynamicFee'


@CSSModules(styles)
export default class DepositWindow extends Component {

  constructor({ swap, flow, onCopyAddress, currencyData }) {
    super()

    this.swap = swap

    this.currency = swap.sellCurrency.toLowerCase()

    this.isSellCurrencyEthOrEthToken = helpers.ethToken.isEthOrEthToken({ name: swap.sellCurrency })
    this.isSellCurrencyEthToken = helpers.ethToken.isEthToken({ name: swap.sellCurrency })

    this.state = {
      swap,
      dynamicFee: 0,
      remainingBalance: this.swap.sellAmount,
      flow: swap.flow.state,
      isBalanceEnough: false,
      isAddressCopied: false,
      isBalanceFetching: false,
      balance: this.isSellCurrencyEthOrEthToken
        ? currencyData.balance - (currencyData.unconfirmedBalance || 0)
        : flow.scriptBalance,
      address: this.isSellCurrencyEthOrEthToken
        ? currencyData.address
        : flow.scriptAddress,
      currencyFullName: currencyData.fullName,
      sellAmount: this.swap.sellAmount,
    }
  }

  updateBalance = async () => {
    const { swap } = this.props
    const { sellAmount, address } = this.state

    let actualBalance

    if (this.isSellCurrencyEthOrEthToken) {
      if (this.isSellCurrencyEthToken) {
        actualBalance = await actions.token.getBalance(this.currency)
      } else {
        actualBalance = await actions.eth.getBalance(this.currency)
      }
    } else {
      const unspents = await actions[this.currency].fetchUnspents(address)
      const totalUnspent = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
      actualBalance = BigNumber(totalUnspent).dividedBy(1e8)
    }

    this.setState(() => ({
      balance: actualBalance,
    }))
  }

  updateRemainingBalance = async () => {
    const { swap } = this.props
    const { sellAmount, balance, dynamicFee } = this.state

    let remainingBalance = new BigNumber(sellAmount).minus(balance)

    if (!this.isSellCurrencyEthToken) {
      remainingBalance = remainingBalance.plus(dynamicFee)
    }

    this.setState(() => ({
      remainingBalance: remainingBalance.dp(6, BigNumber.ROUND_UP),
    }))
  }

  getRequiredAmount = async () => {
    const { swap } = this.props
    const { sellAmount } = this.state

    let dynamicFee = 0

    if (coinsWithDynamicFee.includes(this.currency)) {
      dynamicFee = await helpers[this.currency].estimateFeeValue({ method: 'swap', fixed: true })

      this.setState(() => ({
        dynamicFee,
      }))
    }

    const requiredAmount = BigNumber(sellAmount).plus(dynamicFee).dp(6, BigNumber.ROUND_CEIL)

    this.setState(() => ({
      requiredAmount,
    }))

    this.updateRemainingBalance()
  }

  checkThePayment = () => {
    const { swap, dynamicFee, sellAmount, balance } = this.state

    if (sellAmount.plus(dynamicFee).isLessThanOrEqualTo(balance)) {
      this.setState(() => ({
        isBalanceEnough: true,
      }))

      if (!this.isSellCurrencyEthOrEthToken) {
        swap.flow.skipSyncBalance()
      } else {
        swap.flow.syncBalance()
      }
    }
  }

  createCycleUpdatingBalance = async () => {
    const { sellAmount, balance } = this.state

    let checker
    await this.getRequiredAmount()
    await this.updateRemainingBalance()

    const balanceCheckHandler = async () => {
      const { swap: { flow } } = this.props
      const { ghostScriptValues } = flow.state
      const { isBalanceEnough } = this.state

      const utcNow = Math.floor(Date.now() / 1000)
      const timeLeft = Math.ceil((ghostScriptValues.lockTime - utcNow) / 60)

      if (timeLeft <= 0) {
        flow.stopSwapProcess()

        return true
      }

      if (isBalanceEnough) {
        return true
      }

      await this.updateBalance()
      this.checkThePayment()

      return false
    }

    await balanceCheckHandler()

    checker = setInterval(async () => {
      const needStop = await balanceCheckHandler()

      if (needStop) {
        clearInterval(checker)
      }
    }, 5000)
  }

  onCopyAddress = (e) => {
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

  componentDidMount() {
    this.createCycleUpdatingBalance()
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.balance !== prevState.balance) {
      this.updateRemainingBalance()
    }
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
      missingBalance: (
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
        </div>
      ),
      amount: `${swap.sellAmount}`,
      tokenName: swap.sellCurrency,
      br: <br />,
    }

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
                    defaultMessage="To continue the swap copy this address and top it up with {missingBalance}"
                    values={DontHaveEnoughtFoundsValues}
                  />
                )}
              {/* eslint-enable */}
            </div>
            <div styleName="qrImg">
              <QR address={`${address}?amount=${remainingBalance}`} />
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
                    href={swap.sellCurrency === 'GHOST'
                      ? `${config.link.ghostscan}/address/${address}`
                      : `${config.link.etherscan}/address/${address}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FormattedMessage id="deposit297" defaultMessage="view in explorer" />
                  </a>
                </strong>
              </div>
              <div styleName="qr">
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
                  {isAddressCopied ? <i className="fas fa-copy fa-copy-in" /> : <i className="fas fa-copy" />}
                  <span className="copyText"><FormattedMessage id="deposit312" defaultMessage="copy" /></span>
                </Button>
              </div>
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
                    balance: <strong>{balance === undefined ? this.updateBalance : `${BigNumber(balance).dp(6, BigNumber.ROUND_HALF_CEIL)}`} {swap.sellCurrency}{'  '}</strong>,
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
          {flow.ghostScriptValues !== null &&
            <div styleName="lockTime">
              <i className="far fa-clock" />
              <Timer cancelTime={(flow.ghostScriptValues.lockTime - 7200) * 1000} lockTime={flow.ghostScriptValues.lockTime * 1000} />
            </div>}
        </div>
      </Fragment>
    )
  }

}
