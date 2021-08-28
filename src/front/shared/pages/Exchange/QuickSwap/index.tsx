import { PureComponent } from 'react'
import { connect } from 'redaction'
import { BigNumber } from 'bignumber.js'
import { FormattedMessage } from 'react-intl'
import { isMobile } from 'react-device-detect'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import utils from 'common/utils'
import typeforce from 'swap.app/util/typeforce'
import { AddressFormat, AddressType } from 'domain/address'
import {
  feedback,
  apiLooper,
  externalConfig,
  constants,
  transactions,
  localStorage,
  metamask,
  links,
} from 'helpers'
import actions from 'redux/actions'
import Link from 'local_modules/sw-valuelink'
import { ComponentState, Direction, SwapBlockReason } from './types'
import Button from 'components/controls/Button/Button'
import Address from 'components/ui/Address/Address'
import Copy from 'components/ui/Copy/Copy'
import NewTokenInstruction from './NewTokenInstruction'
import ExchangeForm from './ExchangeForm'
import AdvancedSettings from './AdvancedSettings'
import SwapInfo from './SwapInfo'
import LimitOrders from 'components/LimitOrders'

class QuickSwap extends PureComponent<IUniversalObj, ComponentState> {
  constructor(props) {
    super(props)

    const { match, activeFiat, allCurrencies, tokensWallets } = props
    const { params, path } = match
    const { currencies, wrongNetwork } = actions.oneinch.filterCurrencies({
      currencies: allCurrencies,
      tokensWallets,
    })

    const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)

    let spendedCurrency = currencies[0]
    let receivedList = this.returnReceivedList(currencies, spendedCurrency)
    let receivedCurrency = receivedList[0]

    // if we have url parameters then show it as default values
    if (path.match(/\/quick/) && params.sell && params.buy) {
      const urlSpendedCurrency = currencies.find(
        (item) => item.value.toLowerCase() === params.sell.toLowerCase()
      )
      const urlReceivedList = this.returnReceivedList(currencies, urlSpendedCurrency)
      const urlReceivedCurrency = urlReceivedList.find(
        (item) => item.value.toLowerCase() === params.buy.toLowerCase()
      )

      // reassigning these variables only if url is correct
      if (urlSpendedCurrency && urlReceivedList && urlReceivedCurrency) {
        spendedCurrency = urlSpendedCurrency
        receivedList = urlReceivedList
        receivedCurrency = urlReceivedCurrency
      }
    }

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
      wrongNetwork,
      network: externalConfig.evmNetworks[spendedCurrency.blockchain],
      swapData: undefined,
      swapFee: '',
      gasPrice: '',
      gasLimit: '',
      destReceiver: '',
      showOrders: false,
      mnemonicSaved: mnemonic === '-',
      blockReason: undefined,
    }
  }

  componentDidMount() {
    this.updateNetwork()
    actions.user.getBalances()
  }

  componentDidUpdate(prevProps, prevState) {
    const { wrongNetwork: prevWrongNetwork } = prevState
    const { allCurrencies, tokensWallets } = this.props
    const { spendedCurrency } = this.state

    const availableNetwork = metamask.isAvailableNetworkByCurrency(spendedCurrency.value)

    const needUpdate =
      (!availableNetwork && !prevWrongNetwork) || (prevWrongNetwork && availableNetwork)

    if (metamask.isConnected() && needUpdate) {
      const { currencies, wrongNetwork } = actions.oneinch.filterCurrencies({
        currencies: allCurrencies,
        tokensWallets,
      })
      let spendedCurrency = currencies[0]
      let receivedList = this.returnReceivedList(currencies, spendedCurrency)
      let receivedCurrency = receivedList[0]

      this.setState(() => ({
        wrongNetwork,
        currencies,
        spendedCurrency,
        receivedList,
        receivedCurrency,
      }))
    }
  }

  componentWillUnmount() {
    this.clearWindowTimer()
    this.saveOptionsInStorage()
  }

  saveMnemonic = () => {
    actions.modals.open(constants.modals.SaveMnemonicModal, {
      onClose: () => {
        const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)

        this.setState(() => ({
          mnemonicSaved: mnemonic === '-',
        }))
      },
    })
  }

  createWallet = () => {
    const { history } = this.props
    const { fromWallet } = this.state
    const walletName = fromWallet.tokenKey || fromWallet.currency

    history.push(`${links.createWallet}/${walletName.toUpperCase()}`)
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

  saveOptionsInStorage = () => {
    const { fromWallet, toWallet } = this.state

    const exchangeSettings = localStorage.getItem(constants.localStorage.exchangeSettings)

    if (exchangeSettings) {
      const sell = fromWallet.tokenKey || fromWallet.currency || ''
      const buy = toWallet.tokenKey || toWallet.currency || ''

      exchangeSettings.quickCurrency = {
        sell,
        buy,
      }
      localStorage.setItem(constants.localStorage.exchangeSettings, exchangeSettings)
    }
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
      receivedList,
      receivedCurrency: receivedList[0],
      toWallet: actions.core.getWallet({ currency: receivedList[0].value }),
      receivedAmount: '0',
    }))
    this.resetSwapData()
  }

  reportError = (error) => {
    const possibleNoLiquidity = JSON.stringify(error)?.match(/INSUFFICIENT_ASSET_LIQUIDITY/)

    if (possibleNoLiquidity) {
      this.setState(() => ({ blockReason: SwapBlockReason.NoLiquidity }))
    } else {
      console.group('%c Swap', 'color: red;')
      console.error(error)
      console.groupEnd()
    }

    //const notEnoughBalance = error?.match(/(N|n)ot enough .* balance/)

    /* if (!notEnoughBalance) {
      actions.notifications.show(constants.notifications.ErrorNotification, {
        error: error.message,
      })
      feedback.oneinch.failed(error.message)
    } */

    this.setState(() => ({
      isDataPending: false,
      error,
    }))
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

    /*     const fromAddress = fromWallet.isToken
      ? fromWallet.contractAddress
      : '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    const toAddress = toWallet.isToken
      ? toWallet.contractAddress
      : '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

    const spendedWeiAmount = utils.amount.formatWithDecimals(spendedAmount, 18)

    const request = [
      `/${network.networkVersion}/swap?`,
      `fromTokenAddress=${fromAddress}&`,
      `toTokenAddress=${toAddress}&`,
      `amount=${spendedWeiAmount}&`,
      `fromAddress=${fromWallet.address}&`,
      `slippage=${slippage}`,
    ] */

    /*     if (isAdvancedMode) {
      const gweiDecimals = 9

      if (gasLimit) request.push(`&gasLimit=${gasLimit}`)
      if (gasPrice)
        request.push(`&gasPrice=${utils.amount.formatWithDecimals(gasPrice, gweiDecimals)}`)
      if (destReceiver) request.push(`&destReceiver=${destReceiver}`)
    } */

    const sellToken = fromWallet.isToken
      ? fromWallet.contractAddress
      : '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    const buyToken = toWallet.isToken
      ? toWallet.contractAddress
      : '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

    const sellAmount = utils.amount.formatWithDecimals(spendedAmount, 18)

    const request = [
      `/swap/v1/quote?`,
      `takerAddress=${fromWallet.address}&`,
      `buyToken=${buyToken}&`,
      `sellToken=${sellToken}&`,
      `sellAmount=${sellAmount}`,
    ]

    return request.join('')
  }

  checkSwapData = async () => {
    const { spendedAmount, needApprove } = this.state
    const doNotUpdate = this.isSwapDataNotAvailable() || !spendedAmount || needApprove

    if (!doNotUpdate) {
      await this.fetchSwapData()
    }
  }

  fetchSwapData = async () => {
    const { network, toWallet } = this.state

    /*     const serviceIsOk = await actions.oneinch.serviceIsAvailable({
      chainId: network.networkVersion,
    })

    if (!serviceIsOk) {
      return actions.notifications.show(constants.notifications.Message, {
        message: (
          <FormattedMessage id="serviceIsNotAvailable" defaultMessage="Service is not available" />
        ),
      })
    } */

    this.setState(() => ({
      isDataPending: true,
      blockReason: undefined,
    }))

    try {
      const swap: any = await apiLooper.get('zeroxPolygon', this.createSwapRequest(), {
        reportErrors: this.reportError,
        sourceError: true,
      })

      console.log('%c swap', 'color: orange; font-size: 20px')
      console.log('swap tx: ', swap)

      if (!(swap instanceof Error)) {
        // https://docs.1inch.io/api/quote-swap#swap
        // 1inch docs tells that we have to increase it by 25%
        /* const txGas = new BigNumber(swap.tx.gas).plus((swap.tx.gas / 100) * 25)
        const weiFee = txGas.times(swap.tx.gasPrice)
        const swapFee = utils.amount.formatWithoutDecimals(weiFee, 18) */


        const weiFee = new BigNumber(swap.gas).times(swap.gasPrice)
        const swapFee = utils.amount.formatWithoutDecimals(weiFee, 18)

        this.setState(
          () => ({
            /* receivedAmount: utils.amount.formatWithoutDecimals(
            swap.toTokenAmount,
            swap.toToken.decimals
          ), */
            receivedAmount: utils.amount.formatWithoutDecimals(
              swap.buyAmount,
              // if it's not a token then usual coin with 18 decimals
              toWallet?.decimals || 18
            ),
            swapData: swap,
            swapFee,
          }),
          this.checkTokenApprove
        )
      }
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
      /* const { tx, fromToken } = swapData!

      const receipt = await actions[lowerKey].send({
        data: tx.data,
        to: tx.to,
        amount: utils.amount.formatWithoutDecimals(tx.value, fromToken.decimals),
        gasPrice: tx.gasPrice,
        gasLimit: tx.gas,
        waitReceipt: true,
      }) */

      // TODO: 0x problem? why I have to increase gas limit by myself
      // it was needed just once. Remove it if everything is fine
      // swapData.gas = new BigNumber(swapData.gas).plus(50_000).toString()

      const receipt = await actions[lowerKey].sendReadyTransaction({
        data: swapData,
        waitReceipt: true,
      })

      actions.notifications.show(constants.notifications.Transaction, {
        link: transactions.getLink(lowerKey, receipt.transactionHash),
        completed: true,
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
    const { spendedAmount, fromWallet, network, swapData } = this.state

    if (!fromWallet.isToken) {
      this.setState(() => ({
        needApprove: false,
      }))
    } else {
      const { standard, address, contractAddress, decimals } = fromWallet

      const allowance = await actions.oneinch.fetchTokenAllowance({
        contract: contractAddress,
        owner: address,
        standard,
        decimals,
        spender: swapData.allowanceTarget,
      })

      this.setState(() => ({
        needApprove: new BigNumber(spendedAmount).isGreaterThan(allowance),
      }))
    }
  }

  approve = async () => {
    const { network, spendedAmount, fromWallet, swapData } = this.state

    this.setState(() => ({
      isDataPending: true,
    }))

    const receipt = await actions.oneinch.approveToken({
      amount: spendedAmount,
      name: fromWallet.tokenKey,
      standard: fromWallet.standard,
      target: swapData.allowanceTarget,
    })

    /* const approveInfo: any = await actions.oneinch.approveToken({
      chainId: network.networkVersion,
      amount: utils.amount.formatWithDecimals(spendedAmount, fromWallet.decimals),
      contract: fromWallet.contractAddress,
    })

    if (!approveInfo) return

    const receipt = await actions[fromWallet.baseCurrency].send({
      data: approveInfo.data,
      to: approveInfo.to,
      amount: approveInfo.value,
      gasPrice: approveInfo.gasPrice,
      waitReceipt: true,
    }) */

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
      gasPrice,
      gasLimit,
      destReceiver,
    } = this.state

    const wrongSlippage =
      new BigNumber(slippage).isNaN() ||
      new BigNumber(slippage).isEqualTo(0) ||
      new BigNumber(slippage).isGreaterThan(slippageMaxRange)

    const receivedBaseCurrency = toWallet.baseCurrency?.toUpperCase()
    const maxGweiGasPrice = 30_000
    const minGasLimit = 100_000
    const maxGasLimit = 11_500_000

    const wrongGasPrice =
      new BigNumber(gasPrice).isPositive() && new BigNumber(gasPrice).isGreaterThan(maxGweiGasPrice)

    const wrongGasLimit =
      new BigNumber(gasLimit).isPositive() &&
      (new BigNumber(gasLimit).isLessThan(minGasLimit) ||
        new BigNumber(gasLimit).isGreaterThan(maxGasLimit))

    const wrongReceiverAddress =
      destReceiver && !typeforce.isCoinAddress[receivedBaseCurrency](destReceiver)

    const wrongAdvancedOptions =
      isAdvancedMode && (wrongGasPrice || wrongGasLimit || wrongReceiverAddress)

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

  toggleOrdersViability = () => {
    this.setState((state) => ({
      showOrders: !state.showOrders,
    }))
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
      wrongNetwork,
      network,
      swapData,
      swapFee,
      isAdvancedMode,
      showOrders,
      mnemonicSaved,
      blockReason,
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
    const swapBtnIsDisabled = this.isSwapNotAvailable() || swapDataIsDisabled
    const isWalletCreated = localStorage.getItem(constants.localStorage.isWalletCreate)
    const insufficientBalance = new BigNumber(spendedAmount)
      .plus(swapFee || 0)
      .isGreaterThan(fromWallet.balance)

    return (
      <>
        <NewTokenInstruction />

        <section styleName="someSwap">
          <div styleName={`optionsWrapper ${wrongNetwork ? 'disabled' : ''}`}>
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

            <div styleName="walletAddress">
              {!isWalletCreated ? (
                <Button id="createWalletBtn" brand fullWidth onClick={this.createWallet}>
                  <FormattedMessage id="menu.CreateWallet" defaultMessage="Create wallet" />
                </Button>
              ) : !mnemonicSaved ? (
                <Button id="saveSecretPhraseBtn" brand fullWidth onClick={this.saveMnemonic}>
                  <FormattedMessage
                    id="BTCMS_SaveMnemonicButton"
                    defaultMessage="Save secret phrase"
                  />
                </Button>
              ) : (
                <>
                  <span>
                    <FormattedMessage
                      id="addressOfYourWallet"
                      defaultMessage="Address of your wallet:"
                    />
                  </span>
                  <Copy text={fromWallet.address}>
                    <span styleName="address">
                      <Address
                        address={fromWallet.address}
                        format={isMobile ? AddressFormat.Short : AddressFormat.Full}
                        type={metamask.isConnected() ? AddressType.Metamask : AddressType.Internal}
                      />
                    </span>
                  </Copy>
                </>
              )}
            </div>

            <AdvancedSettings
              isAdvancedMode={isAdvancedMode}
              switchAdvancedMode={this.switchAdvancedMode}
              stateReference={linked}
              swapData={swapData}
              checkSwapData={this.checkSwapData}
              resetSwapData={this.resetSwapData}
            />
          </div>

          <SwapInfo
            network={network}
            swapData={swapData}
            swapFee={swapFee}
            spendedAmount={spendedAmount}
            baseChainWallet={baseChainWallet}
            fromWallet={fromWallet}
            toWallet={toWallet}
            fiat={fiat}
            isDataPending={isDataPending}
          />

          {wrongNetwork && (
            <p styleName="wrongNetworkMessage">
              <FormattedMessage
                id="WalletRow_MetamaskNotAvailableNetwork"
                defaultMessage="Please choose another network"
              />
            </p>
          )}

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
                {blockReason === SwapBlockReason.NoLiquidity ? (
                  <FormattedMessage
                    id="insufficientLiquidity"
                    defaultMessage="Insufficient liquidity"
                  />
                ) : insufficientBalance ? (
                  <FormattedMessage
                    id="insufficientBalance"
                    defaultMessage="Insufficient balance"
                  />
                ) : (
                  <FormattedMessage id="swap" defaultMessage="Swap" />
                )}
              </Button>
            )}
          </div>

          {!wrongNetwork && mnemonicSaved && (
            <Button styleName="button" onClick={this.createLimitOrder} link small>
              <FormattedMessage id="createLimitOrder" defaultMessage="Create limit order" />
            </Button>
          )}
        </section>

        <Button id="orderbookBtn" onClick={this.toggleOrdersViability} link>
          <FormattedMessage id="limitOrders" defaultMessage="Limit orders" />
        </Button>

        {showOrders && <LimitOrders />}
      </>
    )
  }
}
export default connect(({ currencies, user }) => ({
  allCurrencies: currencies.items,
  tokensWallets: user.tokensData,
  activeFiat: user.activeFiat,
}))(CSSModules(QuickSwap, styles, { allowMultiple: true }))
