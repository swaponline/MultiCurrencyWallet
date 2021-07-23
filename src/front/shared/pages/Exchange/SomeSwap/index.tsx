import { PureComponent } from 'react'
import { connect } from 'redaction'
import { BigNumber } from 'bignumber.js'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { COIN_TYPE, COIN_MODEL, COIN_DATA } from 'swap.app/constants/COINS'
import { Token } from 'common/types'
import { feedback, apiLooper, externalConfig, constants, transactions } from 'helpers'
import actions from 'redux/actions'
import Link from 'local_modules/sw-valuelink'
import { ComponentState } from './types'
import Button from 'components/controls/Button/Button'
import ExchangeForm from './ExchangeForm'
import AdvancedOptions from './AdvancedOptions'
import SwapInfo from './SwapInfo'

class SomeSwap extends PureComponent<unknown, ComponentState> {
  constructor(props) {
    super(props)

    const { currencies, activeFiat } = props

    const spendedCurrency = currencies[0]
    const receivedCurrency = currencies[1]

    const fromWallet = actions.core.getWallet({
      currency: spendedCurrency.value,
    })
    const toWallet = actions.core.getWallet({
      currency: receivedCurrency.value,
    })

    this.state = {
      error: null,
      isPending: false,
      isDataPending: false,
      isSwapPending: false,
      isAdvancedMode: false,
      needApprove: fromWallet?.isToken,
      externalExchangeReference: null,
      fiat: window.DEFAULT_FIAT || activeFiat,
      fiatAmount: 0,
      currencies,
      spendedCurrency: spendedCurrency,
      spendedAmount: '',
      fromWallet: fromWallet || {},
      receivedCurrency: receivedCurrency,
      receivedAmount: '0',
      toWallet: toWallet || {},
      slippage: 1,
      slippageMaxRange: 50,
      network: externalConfig.evmNetworks[spendedCurrency.blockchain],
      additionalFeatures: {},
      swapData: undefined,
    }
  }

  componentDidMount() {
    this.updateNetwork()
  }

  updateNetwork = () => {
    const { spendedCurrency } = this.state

    this.setState(() => ({
      network: externalConfig.evmNetworks[spendedCurrency.blockchain],
    }))
  }

  serviceIsAvailable = async () => {
    const { network } = this.state

    try {
      const res: any = await apiLooper.get('oneinch', `/${network.networkVersion}/healthcheck`)

      return res?.status === 'OK'
    } catch (error) {
      this.reportError(error)

      return false
    }
  }

  reportError = (error) => {
    this.setState(() => ({
      error,
    }))
    actions.notifications.show(constants.notifications.ErrorNotification, {
      error: error.message,
    })

    // * feedback...
  }

  createSwapRequest = () => {
    const { network, slippage, spendedAmount, fromWallet, toWallet } = this.state

    const fromAddress = fromWallet.isToken
      ? fromWallet.contractAddress
      : '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    const toAddress = toWallet.isToken
      ? toWallet.contractAddress
      : '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

    const spendedWeiAmount = this.convertIntoWei(spendedAmount, 18)

    return ''.concat(
      `/${network.networkVersion}/swap?`,
      `fromTokenAddress=${fromAddress}&`,
      `toTokenAddress=${toAddress}&`,
      `amount=${spendedWeiAmount}&`,
      `fromAddress=${fromWallet.address}&`,
      `slippage=${slippage}`
    )
  }

  // TODO: find a better place for this calculations
  convertIntoWei = (amount, decimals) => {
    return new BigNumber(amount)
      .times(10 ** decimals)
      .dp(decimals)
      .toString()
  }

  convertFromWei = (amount, decimals) => {
    return new BigNumber(amount)
      .div(10 ** decimals)
      .dp(decimals)
      .toString()
  }
  // TODO ---------------------------

  getSwapData = async () => {
    const serviceIsOk = await this.serviceIsAvailable()

    if (!serviceIsOk) {
      actions.notifications.show(constants.notifications.Message, {
        message: (
          <FormattedMessage
            id="serviceIsNotAvailable"
            defaultMessage="Service is not available. Try to different chain"
          />
        ),
      })

      return
    }

    this.setState(() => ({
      isDataPending: true,
    }))

    try {
      const swap: any = await apiLooper.get('oneinch', this.createSwapRequest())

      this.setState(() => ({
        swapData: swap,
        receivedAmount: this.convertFromWei(swap.toTokenAmount, swap.toToken.decimals),
      }))
    } catch (error) {
      this.reportError(error)
    }

    this.setState(() => ({
      isDataPending: false,
    }))
  }

  swap = async () => {
    const { fromWallet, swapData } = this.state
    const key = fromWallet.standard ? fromWallet.standard : fromWallet.currency
    const lowerKey = key.toLowerCase()

    this.setState(() => ({
      isSwapPending: true,
    }))

    const hash = await actions[lowerKey].sendReadyTransaction({
      txData: swapData?.tx,
    })

    actions.notifications.show(constants.notifications.Transaction, {
      link: transactions.getLink(lowerKey, hash),
    })

    this.setState(() => ({
      swapData: undefined,
      isSwapPending: false,
    }))
  }

  approve = async () => {
    const { network, spendedAmount, fromWallet } = this.state
    const weiAmount = this.convertIntoWei(spendedAmount, fromWallet.decimals)

    const request = ''.concat(
      `/${network.networkVersion}/approve/calldata?`,
      `amount=${weiAmount}&`,
      `tokenAddress=${fromWallet.contractAddress}&`
    )

    this.setState(() => ({
      isDataPending: true,
    }))

    const approveInfo: any = await apiLooper.get('oneinch', request)
    const hash = await actions[fromWallet.baseCurrency].send({
      data: approveInfo.data,
      to: approveInfo.to,
      amount: approveInfo.value,
      gasPrice: approveInfo.gasPrice,
    })

    actions.notifications.show(constants.notifications.Transaction, {
      link: transactions.getLink(fromWallet.standard, hash),
    })

    this.setState(() => ({
      needApprove: false,
      isDataPending: false,
    }))
  }

  selectCurrency = (params) => {
    const { direction, value } = params
    const { spendedCurrency, receivedCurrency } = this.state

    const updateSpendedSide = direction === 'spend' && spendedCurrency.value !== value.value
    const updateReceivedSide = direction === 'receive' && receivedCurrency.value !== value.value

    if (updateSpendedSide) {
      const fromWallet = actions.core.getWallet({ currency: value.value })

      this.setState(
        () => ({
          spendedCurrency: value,
          needApprove: fromWallet.isToken,
          fromWallet,
        }),
        this.updateNetwork
      )
    }

    if (updateReceivedSide) {
      this.setState(() => ({
        receivedCurrency: value,
        toWallet: actions.core.getWallet({ currency: value.value }),
      }))
    }

    console.log(this.state)
  }

  openExternalExchange = () => {
    const { externalExchangeReference } = this.state
    // open itez window
    // wait while the user closes this window or when his currency wallet gets some amount
    // did he close ? then do nothing
    // did he receive currency amount ? so now we can check it and:
    // - start currency -> token exchange
    // - don't start, show an exchange button for user and wait while he clicks on it
    // call a smart contract

    if (
      window.buyViaCreditCardLink &&
      (externalExchangeReference === null || externalExchangeReference.closed)
    ) {
      this.setState(() => ({
        isPending: true,
      }))

      const newWindowProxy = window.open(
        window.buyViaCreditCardLink,
        'externalFiatExchange',
        'location=yes, height=770, width=620, scrollbars, status, resizable'
      )

      this.setState(() => ({
        externalExchangeReference: newWindowProxy,
      }))
      console.log(newWindowProxy)
    } else {
      externalExchangeReference?.focus()
    }

    // externalExchangeReference.open()
    // externalExchangeReference.closed
  }

  switchAdvancedMode = () => {
    this.setState((state) => ({
      isAdvancedMode: !state.isAdvancedMode,
    }))
  }

  isSwapDataNotAvailable = () => {
    const {
      isPending,
      isDataPending,
      spendedAmount,
      fromWallet,
      slippage,
      slippageMaxRange,
    } = this.state

    const wrongSlippage =
      new BigNumber(slippage).isNaN() ||
      new BigNumber(slippage).isEqualTo(0) ||
      new BigNumber(slippage).isGreaterThan(slippageMaxRange)

    // TODO: worry about the commission
    return (
      isPending ||
      isDataPending ||
      wrongSlippage ||
      new BigNumber(spendedAmount).isNaN() ||
      new BigNumber(spendedAmount).isEqualTo(0) ||
      new BigNumber(spendedAmount).isGreaterThan(fromWallet.balance)
    )
  }

  isSwapNotAvailable = () => {
    const { swapData, isSwapPending } = this.state

    return !swapData || isSwapPending
  }

  render() {
    const {
      currencies,
      isPending,
      isDataPending,
      isSwapPending,
      needApprove,
      fiat,
      fiatAmount,
      spendedCurrency,
      spendedAmount,
      fromWallet,
      toWallet,
      receivedCurrency,
      slippage,
      network,
      swapData,
      isAdvancedMode,
      additionalFeatures,
    } = this.state

    const linked = Link.all(this, 'fiatAmount', 'spendedAmount', 'receivedAmount', 'slippage')

    const swapDataBtnIsDisabled = this.isSwapDataNotAvailable()
    const swapBtnIsDisabled = this.isSwapNotAvailable()

    return (
      <section styleName="someSwap">
        <ExchangeForm
          stateReference={linked}
          selectCurrency={this.selectCurrency}
          openExternalExchange={this.openExternalExchange}
          currencies={currencies}
          spendedCurrency={spendedCurrency}
          receivedCurrency={receivedCurrency}
          fiat={fiat}
          fromWallet={fromWallet}
        />

        <AdvancedOptions
          isAdvancedMode={isAdvancedMode}
          switchAdvancedMode={this.switchAdvancedMode}
        />

        <SwapInfo
          network={network}
          swapData={swapData}
          convertFromWei={this.convertFromWei}
          convertIntoWei={this.convertIntoWei}
        />

        <div styleName="buttonWrapper">
          {needApprove ? (
            <Button
              styleName="button"
              pending={isDataPending}
              disabled={swapDataBtnIsDisabled}
              onClick={this.approve}
              brand
            >
              <FormattedMessage
                id="FormattedMessageIdApprove"
                defaultMessage="Approve {token}"
                values={{ token: spendedCurrency.name }}
              />
            </Button>
          ) : (
            <Button
              styleName="button"
              pending={isDataPending}
              disabled={swapDataBtnIsDisabled}
              onClick={this.getSwapData}
              brand
            >
              <FormattedMessage id="checkSwap" defaultMessage="Check the swap" />
            </Button>
          )}

          <Button
            styleName="button"
            pending={isSwapPending}
            disabled={swapBtnIsDisabled}
            onClick={this.swap}
            brand
          >
            <FormattedMessage id="swap" defaultMessage="Swap" />
          </Button>
        </div>
      </section>
    )
  }
}

export default connect(({ currencies, user: { activeFiat } }) => ({
  currencies: currencies.items,
  activeFiat,
}))(CSSModules(SomeSwap, styles, { allowMultiple: true }))
