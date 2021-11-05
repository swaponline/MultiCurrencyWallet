import { PureComponent } from 'react'
import { connect } from 'redaction'
import { BigNumber } from 'bignumber.js'
import { FormattedMessage } from 'react-intl'
import { isMobile } from 'react-device-detect'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import utils from 'common/utils'
import ADDRESSES from 'common/helpers/constants/ADDRESSES'
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
  routing,
  user,
} from 'helpers'
import { localisedUrl } from 'helpers/locale'
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
import NoSwapsReasons from './NoSwapsReasons'
import LimitOrders from 'components/LimitOrders'
import DirectSwap from './DirectSwap' 

class QuickSwap extends PureComponent<IUniversalObj, ComponentState> {
  constructor(props) {
    super(props)

    const {
      match,
      activeFiat,
      allCurrencies,
      history,
    } = props
    const { params, path } = match

    let {
      currentCurrencies,
      receivedList,
      spendedCurrency,
      receivedCurrency,
      wrongNetwork,
    } = this.returnCurrentAssetState(allCurrencies)

    const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)

    if (path.match(/\/quick\/createOrder/)) {
      this.createLimitOrder()
    }

    // if we have url parameters then show it as default values
    if (!wrongNetwork && path.match(/\/quick/) && params.sell && params.buy) {
      const urlSpendedCurrency = currentCurrencies.find(
        (item) => item.value.toLowerCase() === params.sell.toLowerCase()
      )
      if (!urlSpendedCurrency) history.push(localisedUrl('', `${links.quickSwap}`))

      const urlReceivedList = this.returnReceivedList(currentCurrencies, urlSpendedCurrency)
      const urlReceivedCurrency = urlReceivedList.find(
        (item) => item.value.toLowerCase() === params.buy.toLowerCase()
      )

      if (!urlReceivedCurrency) history.push(localisedUrl('', `${links.quickSwap}`))

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
      liquidityErrorMessage: '',
      isPending: false,
      isDataPending: false,
      isSwapPending: false,
      isAdvancedMode: false,
      isDirectSwap: false,
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
      receivedAmount: '',
      toWallet: toWallet || {},
      slippage: 0.5,
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
      coinDecimals: 18,
    }
  }

  componentDidMount() {
    this.updateNetwork()
  }

  componentDidUpdate(prevProps, prevState) {
    const { metamaskData, availableBlockchains } = this.props
    const { metamaskData: prevMetamaskData} = prevProps
    const { wrongNetwork: prevWrongNetwork } = prevState
    const { currencies, spendedCurrency } = this.state

    const chainId = metamask.getChainId()
    const isCurrentNetworkAvailable = !!availableBlockchains[chainId]
    const isSpendedCurrencyNetworkAvailable = metamask.isAvailableNetworkByCurrency(
      spendedCurrency.value
    )
    const switchToCorrectNetwork = prevWrongNetwork && (isSpendedCurrencyNetworkAvailable || isCurrentNetworkAvailable)
    const switchToWrongNetwork = !prevWrongNetwork && !isSpendedCurrencyNetworkAvailable
    const disconnect = prevMetamaskData.isConnected && !metamaskData.isConnected

    const needUpdate =
      disconnect ||
      metamaskData.isConnected &&
      (switchToCorrectNetwork ||
        switchToWrongNetwork ||
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
      const notCurrentSpendedAsset = item.value !== spendedCurrency?.value
      const spendedAsset = item.blockchain || item.value.toUpperCase()
      const receivedAsset = spendedCurrency?.blockchain || spendedCurrency?.value?.toUpperCase()

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
    }))
    this.resetSwapData()
  }

  reportError = (error) => {
    const { liquidityErrorMessage } = this.state
    const possibleNoLiquidity = JSON.stringify(error)?.match(/INSUFFICIENT_ASSET_LIQUIDITY/)
    const insufficientSlippage = JSON.stringify(error)?.match(/IncompleteTransformERC20Error/)
    const notEnoughBalance = error.message?.match(/(N|n)ot enough .* balance/)

    if (possibleNoLiquidity) {
      this.setState(() => ({ blockReason: SwapBlockReason.NoLiquidity }))
    } else if (insufficientSlippage) {
      this.setState(() => ({ blockReason: SwapBlockReason.InsufficientSlippage }))
    } else if (notEnoughBalance) {
      this.setState(() => ({ blockReason: SwapBlockReason.NoBalance }))
    } else if (liquidityErrorMessage) {
      this.setState(() => ({ blockReason: SwapBlockReason.Liquidity }))
    } else {
      this.setState(() => ({ blockReason: SwapBlockReason.Unknown }))
      
      console.group('%c Swap', 'color: red;')
      console.error(error)
      console.groupEnd()
    }

    this.setState(() => ({
      isDataPending: false,
      error,
    }))
  }

  createSwapRequest = (skipValidation = false) => {
    const { slippage, spendedAmount, fromWallet, toWallet, coinDecimals } = this.state

    const sellToken = fromWallet.isToken ? fromWallet.contractAddress : ADDRESSES.EVM_COIN_ADDRESS
    const buyToken = toWallet.isToken ? toWallet.contractAddress : ADDRESSES.EVM_COIN_ADDRESS

    const sellAmount = utils.amount.formatWithDecimals(spendedAmount, fromWallet.decimals || coinDecimals)

    const request = [
      `/swap/v1/quote?`,
      `takerAddress=${fromWallet.address}&`,
      `buyToken=${buyToken}&`,
      `sellToken=${sellToken}&`,
      `sellAmount=${sellAmount}`,
    ]

    if (skipValidation) {
      request.push(`&skipValidation=true`)
    }

    if (slippage) {
      // allow users to enter an amount up to 100, because it's more easy then enter the amount from 0 to 1
      // and now convert it into the api format
      const correctValue = new BigNumber(slippage).dividedBy(100)

      request.push(`&slippagePercentage=${correctValue}`)
    }

    return request.join('')
  }

  checkSwapData = async () => {
    await this.checkTokenApprove()

    const { spendedAmount, needApprove } = this.state
    const doNotUpdate = this.isSwapDataNotAvailable() || !spendedAmount || needApprove

    this.resetSwapData()
    this.setState(() => ({
      error: null,
    }))

    if (!doNotUpdate) {
      await this.fetchSwapData()
    }
  }

  tryToSkipValidation = (error): boolean => {
    const { code, reason, values } = JSON.parse(error.message)
    const INVALID_TX_CODE = 105
    const transactionError = code === INVALID_TX_CODE && reason === 'Error'
    const insufficientSlippage = reason === 'IncompleteTransformERC20Error'

    if (transactionError && !insufficientSlippage) {
      const liquidityError = values.message.match(/^[0-9a-zA-Z]+: K$/m)

      if (liquidityError) {
        this.setState(() => ({
          liquidityErrorMessage: liquidityError[0],
        }))
      }

      return true
    }

    return false
  }

  calculateDataFromSwap = async (params) => {
    const { fromWallet, toWallet, gasLimit, gasPrice, coinDecimals } = this.state
    const { swap, withoutValidation } = params

    // we've had a special error in the previous request. It means there is
    // some problem and we add a "skip validation" parameter to bypass it.
    // Usually the swap tx with this parameter fails in the blockchain,
    // because it's not enough gas limit. Estimate it by yourself
    if (withoutValidation) {
      const baseCurrency = fromWallet.standard ? fromWallet.baseCurrency : fromWallet.currency
      const estimatedGas = await actions[baseCurrency.toLowerCase()]?.estimateGas(swap)

      if (typeof estimatedGas === 'number') {
        swap.gas = estimatedGas
      } else if (estimatedGas instanceof Error) {
        this.reportError(estimatedGas)
      }
    }

    const gweiDecimals = 9
    const customGasLimit = gasLimit && gasLimit > swap.gas ? gasLimit : swap.gas
    const customGasPrice = gasPrice
      ? utils.amount.formatWithDecimals(gasPrice, gweiDecimals)
      : swap.gasPrice

    const weiFee = new BigNumber(customGasLimit).times(customGasPrice)
    const swapFee = utils.amount.formatWithoutDecimals(weiFee, coinDecimals)
    const receivedAmount = utils.amount.formatWithoutDecimals(
      swap.buyAmount,
      toWallet?.decimals || coinDecimals
    )

    this.setState(() => ({
      receivedAmount,
      swapData: swap,
      swapFee,
      isDataPending: false,
    }))
  }

  fetchSwapData = async () => {
    const { network } = this.state

    this.setState(() => ({
      isDataPending: true,
      blockReason: undefined,
    }))

    let repeatRequest = true
    let swapRequest = this.createSwapRequest()

    while (repeatRequest) {
      const swap: any = await apiLooper.get(
        this.returnZeroxApiName(network.networkVersion),
        swapRequest,
        {
          reportErrors: (error) => {
            if (!repeatRequest) {
              this.reportError(error)
            }
          },
          sourceError: true,
        }
      )

      if (!(swap instanceof Error)) {
        repeatRequest = false

        await this.calculateDataFromSwap({
          swap,
          withoutValidation: swapRequest.match(/skipValidation/),
        })
      } else if (this.tryToSkipValidation(swap)) {
        // it's a special error. Will be a new request
        swapRequest = this.createSwapRequest(true)
      } else {
        this.reportError(swap)

        repeatRequest = false
      }
    }
  }

  setSpendedAmount = (value) => {
    this.setState(() => ({
      spendedAmount: value,
    }))
  }

  resetSwapData = () => {
    this.setState(() => ({
      receivedAmount: '',
      swapData: undefined,
    }))
  }

  swap = async () => {
    const { fromWallet, toWallet, swapData, isAdvancedMode, gasLimit, gasPrice } = this.state
    const baseCurrency = fromWallet.standard ? fromWallet.baseCurrency : fromWallet.currency
    const assetName = fromWallet.standard ? fromWallet.tokenKey : fromWallet.currency

    feedback.zerox.startedSwap(`${fromWallet.currency} -> ${toWallet.currency}`)

    this.setState(() => ({
      isSwapPending: true,
    }))

    try {
      if (!swapData) {
        throw new Error('No swap data. Can not complete swap')
      }

      if (isAdvancedMode) {
        const gweiDecimals = 9
  
        if (gasLimit) swapData.gas = gasLimit
        if (gasPrice) swapData.gasPrice = utils.amount.formatWithDecimals(gasPrice, gweiDecimals)
      }

      const txHash = await actions[baseCurrency.toLowerCase()].sendReadyTransaction({
        data: swapData,
      })

      if (txHash) {
        const txInfoUrl = transactions.getTxRouter(assetName.toLowerCase(), txHash)

        routing.redirectTo(txInfoUrl)
      }

      this.resetSwapData()
      this.setState(() => ({
        spendedAmount: '',
      }))
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
        contract: contractAddress,
        owner: address,
        standard,
        decimals,
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
      async () => {
        this.updateNetwork()
        this.updateReceivedList()
        await this.checkSwapData()
      }
    )
  }

  updateReceivedSide = () => {
    const { receivedCurrency } = this.state

    this.setState(
      () => ({
        toWallet: actions.core.getWallet({ currency: receivedCurrency.value }),
      }),
      async () => {
        await this.checkSwapData()
      }
    )
  }

  flipCurrency = () => {
    const { currencies, fromWallet, spendedCurrency, receivedCurrency, toWallet, wrongNetwork } =
      this.state

    if (wrongNetwork || receivedCurrency.notExist) return

    const receivedList = this.returnReceivedList(currencies, receivedCurrency)

    this.setState(
      () => ({
        fromWallet: toWallet,
        spendedCurrency: receivedCurrency,
        receivedList,
        toWallet: fromWallet,
        receivedCurrency: spendedCurrency,
      }),
      async () => {
        await this.checkSwapData()
      }
    )
  }

  openExternalExchange = () => {
    const { externalExchangeReference, fromWallet } = this.state

    const link = user.getExternalExchangeLink({
      address: fromWallet.address,
      currency: fromWallet.currency,
    })

    if (link && (externalExchangeReference === null || externalExchangeReference.closed)) {
      this.setState(() => ({
        isPending: true,
      }))

      const newWindowProxy = window.open(link)

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
      async () => {
        this.resetSwapData()

        const { isAdvancedMode } = this.state
        // update swap data without advanced options
        if (!isAdvancedMode) await this.checkSwapData()
      }
    )
  }

  isSwapDataNotAvailable = () => {
    const {
      isPending,
      isDataPending,
      spendedAmount,
      fromWallet,
      baseChainWallet,
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
    const noBalance = baseChainWallet.balanceError || new BigNumber(baseChainWallet.balance).isEqualTo(0)

    return (
      noBalance ||
      isPending ||
      isDataPending ||
      wrongAdvancedOptions ||
      new BigNumber(spendedAmount).isNaN() ||
      new BigNumber(spendedAmount).isEqualTo(0) ||
      new BigNumber(spendedAmount).isGreaterThan(fromWallet.balance)
    )
  }

  isSwapNotAvailable = () => {
    const { swapData, isSwapPending, error } = this.state

    return !swapData || isSwapPending || !!error
  }

  switchToDirectSwap = () => {
    this.setState(() => ({
      isDirectSwap: true,
    }))
  }

  closeDirectSwap = () => {
    this.setState(() => ({
      isDirectSwap: false,
    }))
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
      receivedAmount,
      wrongNetwork,
      network,
      swapData,
      swapFee,
      isAdvancedMode,
      isDirectSwap,
      showOrders,
      mnemonicSaved,
      blockReason,
      liquidityErrorMessage,
      slippage,
      coinDecimals,
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

    const insufficientBalance = new BigNumber(spendedAmount)
      .plus(swapFee || 0)
      .isGreaterThan(fromWallet.balance)

    const swapDataIsDisabled = this.isSwapDataNotAvailable()
    const swapBtnIsDisabled = this.isSwapNotAvailable() || insufficientBalance || swapDataIsDisabled

    const isWalletCreated = localStorage.getItem(constants.localStorage.isWalletCreate)
    const saveSecretPhrase = !mnemonicSaved && !metamask.isConnected()

    const canMakeDirectSwap = blockReason === SwapBlockReason.Liquidity && swapData && liquidityErrorMessage

    return (
      <>
        <NewTokenInstruction />

        {receivedCurrency.notExist && (
          <p styleName="noAssetsNotice">
            <FormattedMessage
              id="notEnoughAssetsNotice"
              defaultMessage="You don't have available assets for {networkName} to exchange. Please change the network or add a custom asset to the wallet."
              values={{
                networkName: network.chainName,
              }}
            />
          </p>
        )}

        <section styleName="quickSwap">
          {isDirectSwap && swapData ? (
            <DirectSwap
              spendedAmount={spendedAmount}
              receivedAmount={receivedAmount}
              closeDirectSwap={this.closeDirectSwap}
              fromWallet={fromWallet}
              toWallet={toWallet}
              slippage={slippage}
              coinDecimals={coinDecimals}
              liquidityErrorMessage={liquidityErrorMessage}
            />
          ) : (
            <>  
              <div styleName={`${wrongNetwork ? 'disabled' : ''}`}>
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
                  setSpendedAmount={this.setSpendedAmount}
                  fiat={fiat}
                  fromWallet={fromWallet}
                  toWallet={toWallet}
                  updateWallets={this.updateWallets}
                  isPending={isPending}
                  insufficientBalance={insufficientBalance}
                  resetSwapData={this.resetSwapData}
                  slippage={slippage}
                />
              </div>

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

              {!receivedCurrency.notExist && (
                <NoSwapsReasons
                  wrongNetwork={wrongNetwork}
                  blockReason={blockReason}
                  baseChainWallet={baseChainWallet}
                  fromWallet={fromWallet}
                  spendedAmount={spendedAmount}
                  swapFee={swapFee}
                  needApprove={needApprove}
                  spendedCurrency={spendedCurrency}
                />
              )}

              <div styleName="buttonWrapper">
                {needApprove ? (
                  <Button
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
                    pending={isSwapPending}
                    disabled={swapBtnIsDisabled}
                    onClick={this.swap}
                    brand
                  >
                    <FormattedMessage id="swap" defaultMessage="Swap" />
                  </Button>
                )}

                {canMakeDirectSwap && (
                  <Button onClick={this.switchToDirectSwap} brand>
                    <FormattedMessage id="directSwap" defaultMessage="Direct swap" />
                  </Button>
                )}
              </div>
            </>
          )}

          {!wrongNetwork && (mnemonicSaved || metamask.isConnected()) && (
            <Button onClick={this.createLimitOrder} link small>
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

        <Button id="limitOrdersOrderbookBtn" onClick={this.toggleOrdersViability} link>
          <FormattedMessage id="limitOrders" defaultMessage="Limit orders" />
        </Button>

        {showOrders && <LimitOrders />}
      </>
    )
  }
}

export default connect(({ currencies, user, oneinch }) => ({
  allCurrencies: currencies.items,
  tokensWallets: user.tokensData,
  activeFiat: user.activeFiat,
  metamaskData: user.metamaskData,
  availableBlockchains: oneinch.blockchains,
}))(CSSModules(QuickSwap, styles, { allowMultiple: true }))
