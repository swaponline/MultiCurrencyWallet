import { PureComponent } from 'react'
import { connect } from 'redaction'
import { BigNumber } from 'bignumber.js'
import { FormattedMessage } from 'react-intl'
import { isMobile } from 'react-device-detect'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import utils from 'common/utils'
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

    const { match, activeFiat, allCurrencies } = props
    const { params, path } = match

    let {
      currentCurrencies,
      receivedList,
      spendedCurrency,
      receivedCurrency,
      wrongNetwork,
    } = this.returnCurrentAssetState(allCurrencies)

    const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)

    // if we have url parameters then show it as default values
    if (!wrongNetwork && path.match(/\/quick/) && params.sell && params.buy) {
      const urlSpendedCurrency = currentCurrencies.find(
        (item) => item.value.toLowerCase() === params.sell.toLowerCase()
      )
      const urlReceivedList = this.returnReceivedList(currentCurrencies, urlSpendedCurrency)
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
      needApprove: false,
      externalExchangeReference: null,
      externalWindowTimer: null,
      fiat: window.DEFAULT_FIAT || activeFiat,
      fiatAmount: 0,
      currencies: currentCurrencies,
      receivedList,
      baseChainWallet,
      spendedCurrency,
      spendedAmount: '',
      fromWallet: fromWallet || {},
      receivedCurrency,
      receivedAmount: '0',
      toWallet: toWallet || {},
      slippage: undefined,
      slippageMaxRange: 100,
      wrongNetwork,
      network: externalConfig.evmNetworks[spendedCurrency.blockchain || spendedCurrency.value.toUpperCase()],
      swapData: undefined,
      swapFee: '',
      gasPrice: '',
      gasLimit: '',
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
    const { metamaskData } = this.props
    const { metamaskData: prevMetamaskData} = prevProps
    const { wrongNetwork: prevWrongNetwork } = prevState
    const { currencies, spendedCurrency } = this.state

    if (this.isSwapNotAvailable()) {
      this.setState(() => ({
        receivedAmount: '0',
      }))
    }

    const isCurrentNetworkAvailable = metamask.isAvailableNetwork()
    const isSpendedCurrencyNetworkAvailable = metamask.isAvailableNetworkByCurrency(
      spendedCurrency.value
    )

    const needUpdate =
      metamaskData.isConnected &&
      ((prevWrongNetwork && (isSpendedCurrencyNetworkAvailable || isCurrentNetworkAvailable)) ||
        (!prevWrongNetwork && !isSpendedCurrencyNetworkAvailable) ||
        (prevMetamaskData.address !== metamaskData.address))

    if (needUpdate) {
      const {
        currentCurrencies,
        receivedList,
        spendedCurrency,
        receivedCurrency,
        wrongNetwork,
      } = this.returnCurrentAssetState(currencies)

      const baseChainWallet = actions.core.getWallet({
        currency: spendedCurrency.blockchain,
      })

      const fromWallet = actions.core.getWallet({
        currency: spendedCurrency.value,
      })
      const toWallet = actions.core.getWallet({
        currency: receivedCurrency.value,
      })

      this.setState(() => ({
        wrongNetwork,
        currencies: currentCurrencies,
        spendedCurrency,
        receivedList,
        receivedCurrency,
        network: externalConfig.evmNetworks[spendedCurrency.blockchain || spendedCurrency.value.toUpperCase()],
        baseChainWallet,
        fromWallet,
        toWallet
      }))
    }
  }

  componentWillUnmount() {
    this.clearWindowTimer()
    this.saveOptionsInStorage()
  }

  returnCurrentAssetState = (currentCurrencies) => {
    const { allCurrencies, tokensWallets } = this.props

    let { currencies, wrongNetwork } = actions.oneinch.filterCurrencies({
      currencies: allCurrencies,
      tokensWallets,
    })

    if (wrongNetwork) {
      currencies = currentCurrencies
    }

    const spendedCurrency = currencies[0]
    let receivedList = this.returnReceivedList(currencies, spendedCurrency)

    // user doesn't have enough tokens in the wallet. Show a notice about it
    if (!receivedList.length) {
      receivedList = [
        {
          blockchain: '-',
          fullTitle: '-',
          name: '-',
          notExist: true,
        },
      ]
    }

    const receivedCurrency = receivedList[0]

    return {
      wrongNetwork,
      currentCurrencies: currencies,
      receivedList,
      spendedCurrency,
      receivedCurrency,
    }
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

  connectWallet = () => {
    metamask.connect({ dontRedirect: true })
  }

  updateNetwork = () => {
    const { spendedCurrency } = this.state

    const baseChainWallet = actions.core.getWallet({
      currency: spendedCurrency.blockchain,
    })

    this.setState(() => ({
      network: externalConfig.evmNetworks[spendedCurrency.blockchain || spendedCurrency.value.toUpperCase()],
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
    const result = currencies.filter((item) => {
      // except current value from the the spended list
      const notCurrentSpendedAsset = item.value !== spendedCurrency.value
      const spendedAsset = item.blockchain || item.value.toUpperCase()
      const receivedAsset = spendedCurrency.blockchain || spendedCurrency.value.toUpperCase()

      return spendedAsset === receivedAsset && notCurrentSpendedAsset
    })

    return result
  }

  returnZeroxApiName = (chainId) => {
    switch (chainId) {
      case 1:
        return 'zeroxEthereum'
      case 56:
        return 'zeroxBsc'
      case 137:
        return 'zeroxPolygon'
      default:
        return ''
    }
  }

  updateReceivedList = () => {
    const { currencies, spendedCurrency } = this.state
    let receivedList = this.returnReceivedList(currencies, spendedCurrency)

    if (!receivedList.length) {
      receivedList = [
        {
          blockchain: '-',
          fullTitle: '-',
          name: '-',
          notExist: true,
        },
      ]
    }

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
    const insufficientSlippage = JSON.stringify(error)?.match(/IncompleteTransformERC20Error/)
    const notEnoughBalance = error.message?.match(/(N|n)ot enough .* balance/)

    if (possibleNoLiquidity) {
      this.setState(() => ({ blockReason: SwapBlockReason.NoLiquidity }))
    } else if (insufficientSlippage) {
      this.setState(() => ({ blockReason: SwapBlockReason.InsufficientSlippage }))
    } else if (notEnoughBalance) {
      this.setState(() => ({ blockReason: SwapBlockReason.NoBalance }))
    } else {
      console.group('%c Swap', 'color: red;')
      console.error(error)
      console.groupEnd()
    }

    this.setState(() => ({
      isDataPending: false,
      error,
    }))
  }

  createSwapRequest = () => {
    const { slippage, spendedAmount, fromWallet, toWallet, isAdvancedMode } = this.state

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

    if (isAdvancedMode) {
      if (slippage) {
        // allow users to enter an amount up to 100, because it's more easy then enter the amount from 0 to 1
        // and now convert it into the api format
        const correctValue = new BigNumber(slippage).dividedBy(100)

        request.push(`&slippagePercentage=${correctValue}`)
      }
    }

    return request.join('')
  }

  checkSwapData = async () => {
    await this.checkTokenApprove()

    const { spendedAmount, needApprove } = this.state
    const doNotUpdate = this.isSwapDataNotAvailable() || !spendedAmount || needApprove

    this.setState(() => ({
      error: null,
    }))

    if (!doNotUpdate) {
      await this.fetchSwapData()
    }
  }

  fetchSwapData = async () => {
    const {
      network,
      toWallet,
      gasLimit,
      gasPrice,
    } = this.state

    this.setState(() => ({
      isDataPending: true,
      blockReason: undefined,
    }))

    try {
      const swap: any = await apiLooper.get(
        this.returnZeroxApiName(network.networkVersion),
        this.createSwapRequest(),
        {
          reportErrors: this.reportError,
          sourceError: true,
        }
      )

      if (!(swap instanceof Error)) {
        const gweiDecimals = 9
        const customGasLimit = gasLimit && gasLimit > swap.gas ? gasLimit : swap.gas
        const customGasPrice = gasPrice ? utils.amount.formatWithDecimals(gasPrice, gweiDecimals) : swap.gasPrice

        const weiFee = new BigNumber(customGasLimit).times(customGasPrice)
        const swapFee = utils.amount.formatWithoutDecimals(weiFee, 18)

        this.setState(
          () => ({
            receivedAmount: utils.amount.formatWithoutDecimals(
              swap.buyAmount,
              // if it's not a token then usual coin with 18 decimals
              toWallet?.decimals || 18
            ),
            swapData: swap,
            swapFee,
            isDataPending: false,
          }),
          this.checkTokenApprove
        )
      }
    } catch (error) {
      this.reportError(error)
    }
  }

  resetSwapData = () => {
    this.setState(() => ({
      swapData: undefined,
    }))
  }

  swap = async () => {
    const { fromWallet, toWallet, swapData, isAdvancedMode, gasLimit, gasPrice } = this.state
    const key = fromWallet.standard ? fromWallet.baseCurrency : fromWallet.currency
    const lowerKey = key.toLowerCase()

    feedback.zerox.startedSwap(`${fromWallet.currency} -> ${toWallet.currency}`)

    this.setState(() => ({
      isSwapPending: true,
    }))

    try {
      if (swapData && isAdvancedMode) {
        const gweiDecimals = 9
  
        if (gasLimit) swapData.gas = gasLimit
        if (gasPrice) swapData.gasPrice = utils.amount.formatWithDecimals(gasPrice, gweiDecimals)
      }

      if (!swapData) {
        throw new Error('No swap data. Can not complete swap')
      }

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
        chainId: network.chainId,
        spender: externalConfig.swapContract.zerox,
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

    try {
      const transactionHash = await actions.oneinch.approveToken({
        chainId: network.networkVersion,
        amount: spendedAmount,
        name: fromWallet.tokenKey,
        standard: fromWallet.standard,
        spender: externalConfig.swapContract.zerox,
      })

      actions.notifications.show(constants.notifications.Transaction, {
        link: transactions.getLink(fromWallet.standard, transactionHash),
      })

      this.setState(
        () => ({
          needApprove: false,
          isDataPending: false,
        }),
        this.fetchSwapData
      )
    } catch (error) {
      this.reportError(error)
    }
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
        this.updateReceivedList()
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

  flipCurrency = () => {
    const {
      currencies,
      fromWallet,
      spendedCurrency,
      receivedCurrency,
      toWallet,
      wrongNetwork,
    } = this.state

    if (wrongNetwork || receivedCurrency.notExist) return

    const receivedList = this.returnReceivedList(currencies, receivedCurrency)

    this.setState(
      () => ({
        fromWallet: toWallet,
        spendedCurrency: receivedCurrency,
        //
        receivedList,
        toWallet: fromWallet,
        receivedCurrency: spendedCurrency,
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
      slippage,
      slippageMaxRange,
      isAdvancedMode,
      gasPrice,
      gasLimit,
    } = this.state

    const wrongSlippage =
      slippage &&
      (new BigNumber(slippage).isEqualTo(0) ||
        new BigNumber(slippage).isGreaterThan(slippageMaxRange))

    const maxGweiGasPrice = 30_000
    const minGasLimit = 100_000
    const maxGasLimit = 11_500_000

    const wrongGasPrice =
      new BigNumber(gasPrice).isPositive() && new BigNumber(gasPrice).isGreaterThan(maxGweiGasPrice)

    const wrongGasLimit =
      new BigNumber(gasLimit).isPositive() &&
      (new BigNumber(gasLimit).isLessThan(minGasLimit) ||
        new BigNumber(gasLimit).isGreaterThan(maxGasLimit))

    const wrongAdvancedOptions = isAdvancedMode && (wrongGasPrice || wrongGasLimit || wrongSlippage)

    return (
      isPending ||
      isDataPending ||
      wrongAdvancedOptions ||
      new BigNumber(spendedAmount).isNaN() ||
      new BigNumber(spendedAmount).isEqualTo(0) ||
      new BigNumber(spendedAmount).isGreaterThan(fromWallet.balance)
    )
  }

  isSwapNotAvailable = () => {
    const { swapData, isSwapPending, fromWallet, spendedAmount, swapFee, error } = this.state

    const insufficientBalance = new BigNumber(spendedAmount)
      .plus(swapFee)
      .isGreaterThan(fromWallet.balance)

    return !swapData || isSwapPending || insufficientBalance || !!error
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
      'gasLimit'
    )

    const swapDataIsDisabled = this.isSwapDataNotAvailable()
    const swapBtnIsDisabled = this.isSwapNotAvailable() || swapDataIsDisabled
    const isWalletCreated = localStorage.getItem(constants.localStorage.isWalletCreate)
    const insufficientBalance =
      blockReason === SwapBlockReason.NoBalance ||
      new BigNumber(spendedAmount).plus(swapFee || 0).isGreaterThan(fromWallet.balance)

    const saveSecretPhrase = !mnemonicSaved && !metamask.isConnected()

    return (
      <>
        <NewTokenInstruction />

        {receivedCurrency.notExist && (
          <p styleName="noAssetsNotice">
            <FormattedMessage
              id="notEnoughAssetsNotice"
              defaultMessage="You don't have available assets in this network to exchange. Please change the network or add a custom asset to the wallet."
            />
          </p>
        )}

        <section styleName="quickSwap">
          <ExchangeForm
            stateReference={linked}
            selectCurrency={this.selectCurrency}
            flipCurrency={this.flipCurrency}
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

          {blockReason === SwapBlockReason.InsufficientSlippage && (
            <p styleName="swapNotice">
              <FormattedMessage
                id="customSlippageValueNotice"
                defaultMessage="You can set a custom slippage tolerance value in the advanced settings and try again"
              />
            </p>
          )}

          <div styleName="walletAddress">
            {!metamask.isConnected() && (!isWalletCreated || !mnemonicSaved) && (
              <Button
                id="connectWalletBtn"
                brand
                fullWidth
                styleName="connectWalletBtn"
                onClick={this.connectWallet}
              >
                <FormattedMessage
                  id="Exchange_ConnectAddressOption"
                  defaultMessage="Connect Wallet"
                />
              </Button>
            )}
            {!isWalletCreated ? (
              <Button id="createWalletBtn" center onClick={this.createWallet}>
                <FormattedMessage id="menu.CreateWallet" defaultMessage="Create wallet" />
              </Button>
            ) : saveSecretPhrase ? (
              <Button id="saveSecretPhraseBtn" center onClick={this.saveMnemonic}>
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

          <div styleName={`${wrongNetwork || receivedCurrency.notExist ? 'disabled' : ''}`}>
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
                id="pleaseChooseAnotherNetwork"
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
                ) : blockReason === SwapBlockReason.InsufficientSlippage ? (
                  <FormattedMessage
                    id="insufficientSlippage"
                    defaultMessage="Insufficient slippage"
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

          {!wrongNetwork && (mnemonicSaved || metamask.isConnected()) && (
            <Button styleName="button" onClick={this.createLimitOrder} link small>
              <FormattedMessage id="createLimitOrder" defaultMessage="Create limit order" />
            </Button>
          )}
        </section>

        <p styleName="externalServiceWarning">
          <FormattedMessage
            id="disclaimerAbout0x"
            defaultMessage="* Disclaimer: the exchange uses a 3rd 0x Liquidity Protocol. Be carefully and use at your own risk."
          />
        </p>

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
  metamaskData: user.metamaskData,
}))(CSSModules(QuickSwap, styles, { allowMultiple: true }))
