import React, { Fragment, Component } from 'react'

import config from 'app-config'
import { COIN_DATA, COIN_MODEL } from 'swap.app/constants/COINS'
import actions from 'redux/actions'
import helpers from 'helpers'
import erc20Like from 'common/erc20Like'
import CSSModules from 'react-css-modules'
import styles from '../../Swap.scss'
import { BigNumber } from 'bignumber.js'

import { FormattedMessage } from 'react-intl'
import Copy from 'components/ui/Copy/Copy'
import Button from 'components/controls/Button/Button'
import QR from 'components/QR/QR'
import Timer from '../../Timer/Timer'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import COINS_WITH_DYNAMIC_FEE from 'common/helpers/constants/COINS_WITH_DYNAMIC_FEE'

type ComponentState = {
  swap: IUniversalObj
  dynamicFee: number
  remainingBalance: number
  flow: IUniversalObj
  isBalanceEnough: boolean
  isBalanceFetching: boolean
  isSellCurrencyToken: boolean
  isSellCurrencyEvmCoin: boolean
  balance: number
  address: string
  sellAmount: number
  requiredAmount: number
}

@CSSModules(styles)
export default class DepositWindow extends Component<any, ComponentState> {
  _fields = null
  swap = null
  currency = null

  constructor(props) {
    super(props)
    const {
      swap,
      flow,
      currencyData,
      fields,
    } = props

    this._fields = fields

    this.swap = swap

    this.currency = swap.sellCurrency.toLowerCase()

    const isSellCurrencyToken = erc20Like.isToken({ name: swap.sellCurrency })
    const isSellCurrencyEvmCoin = COIN_DATA[swap.sellCurrency].model === COIN_MODEL.AB

    this.state = {
      swap,
      dynamicFee: 0,
      //@ts-ignore: strictNullChecks
      remainingBalance: this.swap.sellAmount,
      flow: swap.flow.state,
      isBalanceEnough: false,
      isBalanceFetching: false,
      isSellCurrencyToken,
      isSellCurrencyEvmCoin,
      balance: isSellCurrencyToken || isSellCurrencyEvmCoin
        ? currencyData.balance - (currencyData.unconfirmedBalance || 0)
        : flow.scriptBalance,
      address: isSellCurrencyToken || isSellCurrencyEvmCoin
        ? currencyData.address
        : flow.scriptAddress,
      //@ts-ignore: strictNullChecks
      sellAmount: this.swap.sellAmount,
      requiredAmount: 0,
    }
  }

  updateBalance = async () => {
    const {
      swap,
      address,
      isSellCurrencyToken,
      isSellCurrencyEvmCoin,
    } = this.state

    let actualBalance
    const sellBlockchain = swap.sellBlockchain

    if (isSellCurrencyToken || isSellCurrencyEvmCoin) {
      if (isSellCurrencyToken) {
        const tokenKey = `{${sellBlockchain}}${swap.sellCurrency}`.toUpperCase()
        const standard = COIN_DATA[tokenKey].standard.toLowerCase()

        actualBalance = await actions[standard].getBalance(this.currency)
      } else {
        actualBalance = await actions[sellBlockchain.toLowerCase()].getBalance()
      }
    } else {
      //@ts-ignore: strictNullChecks
      const unspents = await actions[this.currency].fetchUnspents(address)
      const totalUnspent = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
      actualBalance = new BigNumber(totalUnspent).dividedBy(1e8)
    }

    this.setState(() => ({
      balance: actualBalance,
    }))
  }

  updateRemainingBalance = async () => {
    const { sellAmount, balance, dynamicFee, isSellCurrencyToken } = this.state

    let remainingBalance = new BigNumber(sellAmount).minus(balance)

    if (!isSellCurrencyToken) {
      remainingBalance = remainingBalance.plus(dynamicFee)
    }

    this.setState(() => ({
      remainingBalance: remainingBalance.dp(6, BigNumber.ROUND_UP).toNumber(),
    }))
  }

  getRequiredAmount = async () => {
    const { swap } = this.props
    const { sellAmount } = this.state

    let dynamicFee = 0
    //@ts-ignore: strictNullChecks
    if (COINS_WITH_DYNAMIC_FEE.includes(this.currency)) {
      //@ts-ignore: strictNullChecks
      dynamicFee = await helpers[this.currency].estimateFeeValue({ method: 'swap', fixed: true })

      this.setState(() => ({
        dynamicFee,
      }))
    }

    const requiredAmount = new BigNumber(sellAmount)
      .plus(dynamicFee)
      .dp(6, BigNumber.ROUND_CEIL)
      .toNumber()

    this.setState(() => ({
      requiredAmount,
    }))

    this.updateRemainingBalance()
  }

  checkThePayment = () => {
    const {
      swap,
      dynamicFee,
      sellAmount,
      balance,
      isSellCurrencyToken,
      isSellCurrencyEvmCoin,
    } = this.state

    if (new BigNumber(sellAmount).plus(dynamicFee).isLessThanOrEqualTo(balance)) {
      this.setState(() => ({
        isBalanceEnough: true,
      }))

      if (isSellCurrencyToken || isSellCurrencyEvmCoin) {
        swap.flow.syncBalance()
      } else {
        swap.flow.skipSyncBalance()
      }
    }
  }

  createCycleUpdatingBalance = async () => {
    //@ts-ignore: strictNullChecks
    const { scriptValues } = this._fields

    let checker
    await this.getRequiredAmount()
    await this.updateRemainingBalance()

    const balanceCheckHandler = async () => {
      const {
        swap: {
          flow,
          flow: {
            state: flowState,
          }
        },
      } = this.props
      const { isBalanceEnough } = this.state

      const utcNow = Math.floor(Date.now() / 1000)
      const timeLeft = Math.ceil((flowState[scriptValues].lockTime - utcNow) / 60)

      if (timeLeft <= 0) {
        console.group('%c UTXO swap deposit modal', 'color: yellow;')
        console.log('Stop swap process in DepositWindow')
        console.log('timeLeft: ', timeLeft)
        console.groupEnd()

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

  handleReloadBalance = async () => {
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
      requiredAmount,
      isBalanceEnough,
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
            </div>
          </Tooltip>
        </div>
      ),
      amount: `${swap.sellAmount}`,
      tokenName: swap.sellCurrency,
      br: <br />,
    }

    //@ts-ignore: strictNullChecks
    const { currencyName, explorerLink, scriptValues } = this._fields

    return (
      <Fragment>
        <div
          styleName="topUpLink"
        >
          <div styleName="top">
            <div styleName="btcMessage">
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
            </div>
          </div>
          <div styleName="qrImg">
              <QR address={`${address}?amount=${remainingBalance}`} />
            </div>
          <Copy text={address}>
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
                    href={swap.sellCurrency === currencyName
                      ? `${explorerLink}/address/${address}`
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
                <a styleName="linkAddress">
                  {address}
                </a>
                <Button brand fullWidth>
                  <i className="fas fa-copy" />
                  <span className="copyText">
                    <FormattedMessage id="deposit312" defaultMessage="copy" />
                  </span>
                </Button>
              </div>
            </div>
          </Copy>
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
                    balance: <strong>{balance === undefined ? this.updateBalance : `${new BigNumber(balance).dp(6, BigNumber.ROUND_HALF_CEIL)}`} {swap.sellCurrency}{'  '}</strong>,
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
          {flow[scriptValues] !== null &&
            <div styleName="lockTime">
              <i className="far fa-clock" />
              <Timer cancelTime={(flow[scriptValues].lockTime - 7200) * 1000} lockTime={flow[scriptValues].lockTime * 1000} />
            </div>}
        </div>
      </Fragment>
    )
  }
}