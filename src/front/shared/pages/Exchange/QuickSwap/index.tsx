import { PureComponent } from 'react'
import { connect } from 'redaction'
import { BigNumber } from 'bignumber.js'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import typeforce from 'swap.app/util/typeforce'
import { COIN_TYPE, COIN_MODEL, COIN_DATA } from 'swap.app/constants/COINS'
import { Token } from 'common/types'
import getCoinInfo from 'common/coins/getCoinInfo'
import erc20Like from 'common/erc20Like'
import { feedback, apiLooper, externalConfig, constants, transactions } from 'helpers'
import actions from 'redux/actions'
import Link from 'local_modules/sw-valuelink'
import { ComponentState } from './types'
import Button from 'components/controls/Button/Button'
import ExchangeForm from './ExchangeForm'
import AdvancedSettings from './AdvancedSettings'
import SwapInfo from './SwapInfo'

// TODO: add feedback events

// TODO: for production save only ETH chain as available

// TODO: be careful with this component render
// we don't want to filter all currencies on each excess render
// double check in what kind of cases it can happen

class QuickSwap extends PureComponent<unknown, ComponentState> {
  constructor(props) {
    super(props)

    const { currencies, oneinchTokens, activeFiat } = props

    const spendedCurrency = currencies[0]
    const receivedList = this.returnReceivedList(currencies, spendedCurrency)
    const receivedCurrency = receivedList[0]

    const baseChainWallet = actions.core.getWallet({
      currency: spendedCurrency.blockchain,
    })
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
      externalWindowTimer: null,
      fiat: window.DEFAULT_FIAT || activeFiat,
      fiatAmount: 0,
      currencies,
      receivedList,
      baseChainWallet,
      spendedCurrency: spendedCurrency,
      spendedAmount: '',
      fromWallet: fromWallet || {},
      receivedCurrency: receivedCurrency,
      receivedAmount: '0',
      toWallet: toWallet || {},
      slippage: 1,
      slippageMaxRange: 50,
      network: externalConfig.evmNetworks[spendedCurrency.blockchain],
      swapData: undefined,
      swapFee: '',
      gasPrice: '',
      gasLimit: '',
      destReceiver: '',
    }
  }

  componentDidMount() {
    this.updateNetwork()
  }

  componentWillUnmount() {
    this.clearWindowTimer()
  }

  updateNetwork = () => {
    const { spendedCurrency } = this.state

    const baseChainWallet = actions.core.getWallet({
      currency: spendedCurrency.blockchain,
    })

    this.setState(() => ({
      network: externalConfig.evmNetworks[spendedCurrency.blockchain],
      baseChainWallet,
    }))
  }

  returnReceivedList = (currencies, spendedCurrency) => {
    return currencies.filter(
      (item) =>
        item.blockchain === spendedCurrency.blockchain && item.value !== spendedCurrency.value
    )
  }

  resetReceivedList = () => {
    const { currencies, spendedCurrency } = this.state
    const receivedList = this.returnReceivedList(currencies, spendedCurrency)

    this.setState(() => ({
      receivedList: receivedList,
      receivedCurrency: receivedList[0],
      toWallet: actions.core.getWallet({ currency: receivedList[0].value }),
      swapData: undefined,
      receivedAmount: '0',
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
    console.group('%c Swap', 'color: red;')
    console.error(error)
    console.groupEnd()

    actions.notifications.show(constants.notifications.ErrorNotification, {
      error: error.message,
    })

    // * feedback...
  }

  createSwapRequest = () => {
    const {
      network,
      slippage,
      spendedAmount,
      fromWallet,
      toWallet,
      isAdvancedMode,
      gasPrice,
      gasLimit,
      destReceiver,
    } = this.state

    const fromAddress = fromWallet.isToken
      ? fromWallet.contractAddress
      : '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    const toAddress = toWallet.isToken
      ? toWallet.contractAddress
      : '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

    const spendedWeiAmount = this.convertIntoWei(spendedAmount, 18)

    const request = [
      `/${network.networkVersion}/swap?`,
      `fromTokenAddress=${fromAddress}&`,
      `toTokenAddress=${toAddress}&`,
      `amount=${spendedWeiAmount}&`,
      `fromAddress=${fromWallet.address}&`,
      `slippage=${slippage}`,
    ]

    if (isAdvancedMode) {
      if (gasLimit) request.push(`&gasLimit=${gasLimit}`)
      if (gasPrice) request.push(`&gasPrice=${this.convertIntoWei(gasPrice, 9)}`)
      if (destReceiver) request.push(`&destReceiver=${destReceiver}`)
    }

    return request.join('')
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
  // ---------------------------

  checkSwapData = async () => {
    const { spendedAmount } = this.state

    const doNotUpdate = this.isSwapDataNotAvailable() || !spendedAmount

    if (!doNotUpdate) {
      await this.fetchSwapData()
    }
  }

  fetchSwapData = async () => {
    const serviceIsOk = await this.serviceIsAvailable()

    if (!serviceIsOk) {
      actions.notifications.show(constants.notifications.Message, {
        message: (
          <FormattedMessage id="serviceIsNotAvailable" defaultMessage="Service is not available" />
        ),
      })

      return
    }

    this.setState(() => ({
      isDataPending: true,
    }))

    try {
      const swap: any = await apiLooper.get('oneinch', this.createSwapRequest(), {
        reportErrors: this.reportError,
      })
      const weiFee = new BigNumber(swap.tx.gas).times(swap.tx.gasPrice)
      const swapFee = this.convertFromWei(weiFee, 18)

      this.setState(() => ({
        receivedAmount: this.convertFromWei(swap.toTokenAmount, swap.toToken.decimals),
        swapData: swap,
        swapFee,
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
    const key = fromWallet.standard ? fromWallet.baseCurrency : fromWallet.currency
    const lowerKey = key.toLowerCase()

    this.setState(() => ({
      isSwapPending: true,
    }))

    try {
      const { tx, fromToken } = swapData!

      const { transactionHash } = await actions[lowerKey].send({
        data: tx.data,
        to: tx.to,
        amount: this.convertFromWei(tx.value, fromToken.decimals),
        gasPrice: tx.gasPrice,
        gasLimit: tx.gas,
      })

      actions.notifications.show(constants.notifications.Transaction, {
        link: transactions.getLink(lowerKey, transactionHash),
      })

      this.setState(() => ({
        // delete last swap data, the swap info may have changed
        swapData: undefined,
      }))
    } catch (error) {
      this.reportError(error)
    } finally {
      this.setState(() => ({
        isSwapPending: false,
      }))
    }
  }

  needTokenApprove = async (params) => {
    const { owner, contract, decimals, standard } = params
    const { spendedAmount } = this.state

    const allowance = await erc20Like[standard].checkAllowance({
      tokenOwnerAddress: owner,
      tokenContractAddress: contract,
      decimals: decimals,
    })

    return new BigNumber(spendedAmount).isGreaterThan(allowance)
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
    const receipt = await actions[fromWallet.baseCurrency].send({
      data: approveInfo.data,
      to: approveInfo.to,
      amount: approveInfo.value,
      gasPrice: approveInfo.gasPrice,
      waitReceipt: true,
    })

    actions.notifications.show(constants.notifications.Transaction, {
      link: transactions.getLink(fromWallet.standard, receipt.transactionHash),
    })

    this.setState(() => ({
      needApprove: false,
      isDataPending: false,
    }))
  }

  selectCurrency = (params) => {
    const { direction, value } = params
    const { spendedCurrency, receivedCurrency } = this.state

    const changeSpendedSide = direction === 'spend' && spendedCurrency.value !== value.value
    const changeReceivedSide = direction === 'receive' && receivedCurrency.value !== value.value

    if (changeSpendedSide) {
      this.setState(
        () => ({
          spendedCurrency: value,
        }),
        this.updateSpendedSide
      )
    }

    if (changeReceivedSide) {
      this.setState(
        () => ({
          receivedCurrency: value,
        }),
        this.updateReceivedSide
      )
    }
  }

  updateSpendedSide = async () => {
    const { spendedCurrency } = this.state

    const fromWallet = actions.core.getWallet({ currency: spendedCurrency.value })
    let needApprove = false

    if (fromWallet.isToken) {
      needApprove = await this.needTokenApprove({
        standard: fromWallet.standard,
        owner: fromWallet.address,
        contract: fromWallet.contractAddress,
        decimals: fromWallet.decimals,
      })
    }

    this.setState(
      () => ({
        needApprove,
        fromWallet,
        swapData: undefined,
      }),
      () => {
        this.updateNetwork()
        this.resetReceivedList()
        this.checkSwapData()
      }
    )
  }

  updateReceivedSide = () => {
    const { receivedCurrency } = this.state

    this.setState(
      () => ({
        toWallet: actions.core.getWallet({ currency: receivedCurrency.value }),
        swapData: undefined,
        receivedAmount: '0',
      }),
      this.checkSwapData
    )
  }

  openExternalExchange = () => {
    const { externalExchangeReference } = this.state

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

      this.setState(
        () => ({
          externalExchangeReference: newWindowProxy,
        }),
        this.startCheckingExternalWindow
      )
    } else {
      // in this case window reference must exist and the window is not closed
      externalExchangeReference?.focus()
    }
  }

  startCheckingExternalWindow = () => {
    const { externalExchangeReference } = this.state

    const timer = setInterval(() => {
      if (externalExchangeReference?.closed) {
        this.closeExternalExchange()
      }
    }, 1000)

    this.setState(() => ({
      externalWindowTimer: timer,
    }))
  }

  closeExternalExchange = () => {
    const { externalExchangeReference, externalWindowTimer } = this.state

    if (externalExchangeReference) {
      externalExchangeReference.close()

      this.setState(() => ({
        externalExchangeReference: null,
      }))
    }

    if (externalWindowTimer) {
      clearInterval(externalWindowTimer)

      this.setState(() => ({
        externalWindowTimer: null,
      }))
    }

    this.setState(() => ({
      isPending: false,
    }))
  }

  clearWindowTimer = () => {
    const { externalWindowTimer } = this.state

    if (externalWindowTimer) {
      clearInterval(externalWindowTimer)
    }
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
      toWallet,
      slippage,
      slippageMaxRange,
      isAdvancedMode,
      destReceiver,
    } = this.state

    const wrongSlippage =
      new BigNumber(slippage).isNaN() ||
      new BigNumber(slippage).isEqualTo(0) ||
      new BigNumber(slippage).isGreaterThan(slippageMaxRange)

    const receivedBaseCurrency = toWallet.baseCurrency.toUpperCase()
    const wrongAdvancedOptions =
      isAdvancedMode && !typeforce.isCoinAddress[receivedBaseCurrency](destReceiver)

    return (
      isPending ||
      isDataPending ||
      wrongSlippage ||
      wrongAdvancedOptions ||
      new BigNumber(spendedAmount).isNaN() ||
      new BigNumber(spendedAmount).isEqualTo(0) ||
      new BigNumber(spendedAmount).isGreaterThan(fromWallet.balance)
    )
  }

  isSwapNotAvailable = () => {
    const { swapData, isSwapPending, fromWallet, spendedAmount, swapFee } = this.state

    const insufficientBalance = new BigNumber(spendedAmount)
      .plus(swapFee)
      .isGreaterThan(fromWallet.balance)

    return !swapData || isSwapPending || insufficientBalance
  }

  render() {
    const {
      currencies,
      receivedList,
      baseChainWallet,
      isPending,
      isDataPending,
      isSwapPending,
      needApprove,
      fiat,
      spendedAmount,
      spendedCurrency,
      fromWallet,
      toWallet,
      receivedCurrency,
      network,
      swapData,
      swapFee,
      isAdvancedMode,
    } = this.state

    const linked = Link.all(
      this,
      'fiatAmount',
      'spendedAmount',
      'receivedAmount',
      'slippage',
      'gasPrice',
      'gasLimit',
      'destReceiver'
    )

    const swapDataIsDisabled = this.isSwapDataNotAvailable()
    const swapBtnIsDisabled = this.isSwapNotAvailable()

    return (
      <section styleName="someSwap">
        <ExchangeForm
          stateReference={linked}
          selectCurrency={this.selectCurrency}
          openExternalExchange={this.openExternalExchange}
          checkSwapData={this.checkSwapData}
          currencies={currencies}
          receivedList={receivedList}
          spendedAmount={spendedAmount}
          spendedCurrency={spendedCurrency}
          receivedCurrency={receivedCurrency}
          fiat={fiat}
          fromWallet={fromWallet}
          toWallet={toWallet}
          isPending={isPending}
        />

        <AdvancedSettings
          isAdvancedMode={isAdvancedMode}
          switchAdvancedMode={this.switchAdvancedMode}
          stateReference={linked}
        />

        <SwapInfo
          network={network}
          swapData={swapData}
          swapFee={swapFee}
          baseChainWallet={baseChainWallet}
          fiat={fiat}
          isDataPending={isDataPending}
          isSwapPending={isSwapPending}
          convertFromWei={this.convertFromWei}
          convertIntoWei={this.convertIntoWei}
        />

        <div styleName="buttonWrapper">
          {needApprove ? (
            <Button
              styleName="button"
              pending={isDataPending}
              disabled={swapDataIsDisabled}
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
              pending={isSwapPending}
              disabled={swapBtnIsDisabled}
              onClick={this.swap}
              brand
            >
              <FormattedMessage id="swap" defaultMessage="Swap" />
            </Button>
          )}
        </div>
      </section>
    )
  }
}

// TODO: decide to load this data from different component
// like on App.tsx loading or fetch it from this component
// (only when it renders)
const fetch1inchTokens = async () => {
  const availableChains = [1, 56, 137]

  Object.keys(externalConfig.evmNetworks).forEach(async (nativeCurrency) => {
    const chainInfo = externalConfig.evmNetworks[nativeCurrency]

    if (availableChains.includes(chainInfo.networkVersion)) {
      const data: any = await apiLooper.get('oneinch', `/${chainInfo.networkVersion}/tokens`)

      actions.oneinch.addTokens({
        chainId: chainInfo.networkVersion,
        tokens: data?.tokens,
      })
    }
  })
}

fetch1inchTokens()

const filterCurrencies = (params) => {
  const { currencies, tokensWallets, oneinchTokens } = params

  return currencies.filter((item) => {
    const currency = COIN_DATA[item.name]

    if (item.standard) {
      const { blockchain } = getCoinInfo(item.value)

      const networkVersion = externalConfig.evmNetworks[blockchain].networkVersion
      const walletKey = item.value.toLowerCase()
      const tokensByChain = oneinchTokens[networkVersion]

      // if token is in the object then it's true
      return tokensByChain[tokensWallets[walletKey].contractAddress]
    }

    return currency?.model === COIN_MODEL.AB
  })
}

export default connect(({ currencies, user }) => ({
  currencies: filterCurrencies({
    currencies: currencies.items,
    tokensWallets: user.tokensData,
    oneinchTokens: currencies.oneinch,
  }),
  activeFiat: user.activeFiat,
}))(CSSModules(QuickSwap, styles, { allowMultiple: true }))
