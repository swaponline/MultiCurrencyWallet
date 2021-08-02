import { PureComponent } from 'react'
import { connect } from 'redaction'
import { BigNumber } from 'bignumber.js'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import typeforce from 'swap.app/util/typeforce'
import { COIN_MODEL, COIN_DATA, BLOCKCHAIN } from 'swap.app/constants/COINS'
import getCoinInfo from 'common/coins/getCoinInfo'
import { feedback, apiLooper, externalConfig, constants, transactions, metamask } from 'helpers'
import actions from 'redux/actions'
import Link from 'local_modules/sw-valuelink'
import { ComponentState, Direction } from './types'
import Button from 'components/controls/Button/Button'
import ExchangeForm from './ExchangeForm'
import AdvancedSettings from './AdvancedSettings'
import SwapInfo from './SwapInfo'
import LimitOrders from './LimitOrders'

// TODO: UI: adapt for mobile resolution

class QuickSwap extends PureComponent<unknown, ComponentState> {
  constructor(props) {
    super(props)

    const { currencies, activeFiat } = props

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
    actions.user.getBalances()
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

  updateWallets = () => {
    const { spendedCurrency, receivedCurrency } = this.state

    const fromWallet = actions.core.getWallet({
      currency: spendedCurrency.value,
    })
    const toWallet = actions.core.getWallet({
      currency: receivedCurrency.value,
    })

    this.setState(() => ({
      fromWallet,
      toWallet,
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
      receivedAmount: '0',
    }))
    this.resetSwapData()
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

    feedback.oneinch.failed(error.message)
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
      const gweiDecimals = 9

      if (gasLimit) request.push(`&gasLimit=${gasLimit}`)
      if (gasPrice) request.push(`&gasPrice=${this.convertIntoWei(gasPrice, gweiDecimals)}`)
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
    await this.checkTokenApprove()

    const { spendedAmount, needApprove } = this.state
    const doNotUpdate = this.isSwapDataNotAvailable() || !spendedAmount || needApprove

    if (!doNotUpdate) {
      await this.fetchSwapData()
    }
  }

  fetchSwapData = async () => {
    const { network } = this.state

    const serviceIsOk = await actions.oneinch.serviceIsAvailable({
      chainId: network.networkVersion,
    })

    if (!serviceIsOk) {
      return actions.notifications.show(constants.notifications.Message, {
        message: (
          <FormattedMessage id="serviceIsNotAvailable" defaultMessage="Service is not available" />
        ),
      })
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

  resetSwapData = () => {
    this.setState(() => ({
      swapData: undefined,
    }))
  }

  swap = async () => {
    const { fromWallet, toWallet, swapData } = this.state
    const key = fromWallet.standard ? fromWallet.baseCurrency : fromWallet.currency
    const lowerKey = key.toLowerCase()

    feedback.oneinch.startedSwap(`${fromWallet.currency} -> ${toWallet.currency}`)

    this.setState(() => ({
      isSwapPending: true,
    }))

    try {
      const { tx, fromToken } = swapData!

      const receipt = await actions[lowerKey].send({
        data: tx.data,
        to: tx.to,
        amount: this.convertFromWei(tx.value, fromToken.decimals),
        gasPrice: tx.gasPrice,
        gasLimit: tx.gas,
        waitReceipt: true,
      })

      actions.notifications.show(constants.notifications.Transaction, {
        link: transactions.getLink(lowerKey, receipt.transactionHash),
      })

      // delete last swap data, the swap info may have changed
      this.setState(() => ({
        spendedAmount: '',
        receivedAmount: '',
      }))
      this.resetSwapData()
    } catch (error) {
      this.reportError(error)
    } finally {
      this.setState(() => ({
        isSwapPending: false,
      }))
    }
  }

  checkTokenApprove = async () => {
    const { spendedAmount, fromWallet, network } = this.state

    if (!fromWallet.isToken) {
      this.setState(() => ({
        needApprove: false,
      }))
    } else {
      const { standard, address, contractAddress, decimals } = fromWallet

      const allowance = await actions.oneinch.fetchTokenAllowance({
        chainId: network.networkVersion,
        contract: contractAddress,
        owner: address,
        standard,
        decimals,
      })

      this.setState(() => ({
        needApprove: new BigNumber(spendedAmount).isGreaterThan(allowance),
      }))
    }
  }

  approve = async () => {
    const { network, spendedAmount, fromWallet } = this.state

    this.setState(() => ({
      isDataPending: true,
    }))

    const approveInfo: any = await actions.oneinch.approveToken({
      chainId: network.networkVersion,
      amount: this.convertIntoWei(spendedAmount, fromWallet.decimals),
      contract: fromWallet.contractAddress,
    })

    if (!approveInfo) return

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

    this.setState(
      () => ({
        needApprove: false,
        isDataPending: false,
      }),
      this.fetchSwapData
    )
  }

  selectCurrency = (params) => {
    const { direction, value } = params
    const { spendedCurrency, receivedCurrency } = this.state

    const changeSpendedSide = direction === Direction.Spend && spendedCurrency.value !== value.value
    const changeReceivedSide =
      direction === Direction.Receive && receivedCurrency.value !== value.value

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

    this.setState(
      () => ({
        fromWallet,
      }),
      () => {
        this.resetSwapData()
        this.updateNetwork()
        this.checkTokenApprove()
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
        receivedAmount: '0',
      }),
      () => {
        this.resetSwapData()
        this.checkSwapData()
      }
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
    this.setState(
      (state) => ({
        isAdvancedMode: !state.isAdvancedMode,
      }),
      () => {
        const { isAdvancedMode } = this.state
        // update swap data without advanced options
        if (!isAdvancedMode) this.checkSwapData()
      }
    )
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

    const receivedBaseCurrency = toWallet.baseCurrency?.toUpperCase()
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

  createLimitOrder = () => {
    actions.modals.open(constants.modals.LimitOrder)
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
      <>
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
            updateWallets={this.updateWallets}
            isPending={isPending}
          />

          <AdvancedSettings
            isAdvancedMode={isAdvancedMode}
            switchAdvancedMode={this.switchAdvancedMode}
            stateReference={linked}
            swapData={swapData}
            checkSwapData={this.checkSwapData}
            resetSwapData={this.resetSwapData}
          />

          <SwapInfo
            network={network}
            swapData={swapData}
            swapFee={swapFee}
            baseChainWallet={baseChainWallet}
            fiat={fiat}
            isDataPending={isDataPending}
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

          <Button styleName="button" onClick={this.createLimitOrder} link small>
            <FormattedMessage id="createLimitOrder" defaultMessage="Create limit order" />
          </Button>
        </section>

        <LimitOrders />
      </>
    )
  }
}

const filterCurrencies = (params) => {
  const { currencies, tokensWallets, oneinchTokens } = params

  return currencies.filter((item) => {
    const currency = COIN_DATA[item.name]
    let isCurrencySuitable = false

    // it's token. Check it in the 1inch matched token list
    if (item.standard) {
      const { blockchain } = getCoinInfo(item.value)

      const networkVersion = externalConfig.evmNetworks[blockchain].networkVersion
      const walletKey = item.value.toLowerCase()
      const tokensByChain = oneinchTokens[networkVersion]

      isCurrencySuitable =
        // if token is in the object then it's true
        tokensByChain && !!tokensByChain[tokensWallets[walletKey].contractAddress]
    } else {
      isCurrencySuitable = currency?.model === COIN_MODEL.AB
    }
    // connected metamask allows only one chain
    const suitableForNetwork = metamask.isConnected()
      ? metamask.isAvailableNetworkByCurrency(item.value)
      : true

    return isCurrencySuitable && suitableForNetwork
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
