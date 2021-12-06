import { PureComponent } from 'react'
import { connect } from 'redaction'
import { BigNumber } from 'bignumber.js'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import getCoinInfo from 'common/coins/getCoinInfo'
import utils from 'common/utils'
import erc20Like from 'common/erc20Like'
import ADDRESSES, { EVM_COIN_ADDRESS, ZERO_ADDRESS } from 'common/helpers/constants/ADDRESSES'
import {
  apiLooper,
  externalConfig,
  constants,
  localStorage,
  metamask,
  links,
  user,
  cacheStorageGet,
  cacheStorageSet,
} from 'helpers'
import { localisedUrl } from 'helpers/locale'
import actions from 'redux/actions'
import Link from 'local_modules/sw-valuelink'
import {
  ComponentState,
  Direction,
  BlockReasons,
  Sections,
  Actions,
  CurrencyMenuItem,
} from './types'
import {
  API_NAME,
  GWEI_DECIMALS,
  COIN_DECIMALS,
  API_GAS_LIMITS,
  MAX_PERCENT,
  LIQUIDITY_SOURCE_DATA,
} from './constants'
import Button from 'components/controls/Button/Button'
import TokenInstruction from './TokenInstruction'
import Header from './Header'
import InputForm from './InputForm'
import SourceActions from './SourceActions'
import UserInfo from './UserInfo'
import Settings from './Settings'
import Feedback from './Feedback'
import Footer from './Footer'
import LimitOrders from 'components/LimitOrders'

const QuickswapModes = {
  aggregator: 'aggregator',
  source: 'source',
  only_aggregator: 'only_aggregator',
  only_source: 'only_source',
}

class QuickSwap extends PureComponent<IUniversalObj, ComponentState> {
  constructor(props) {
    super(props)

    const { match, activeFiat, allCurrencies, history } = props
    const { params, path } = match

    let {
      currentCurrencies,
      receivedList,
      spendedCurrency,
      receivedCurrency,
      wrongNetwork,
    } = this.returnCurrentAssetState(allCurrencies)

    if (externalConfig.opts.defaultQuickSell) {
      const defaultSellCurrency = allCurrencies.filter((curData) => { return curData.value.toUpperCase() === externalConfig.opts.defaultQuickSell.toUpperCase() })
      if (defaultSellCurrency.length) {
        spendedCurrency = defaultSellCurrency[0]
        receivedList = this.returnReceivedList(allCurrencies, spendedCurrency)
      }
    }
    if (externalConfig.opts.defaultQuickBuy) {
      const defaultBuyCurrency = allCurrencies.filter((curData) => { return curData.value.toUpperCase() === externalConfig.opts.defaultQuickBuy.toUpperCase() })
      if (defaultBuyCurrency.length) receivedCurrency = defaultBuyCurrency[0]
    }

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

    const mode = QuickswapModes[window.quickswapMode]
    let onlyAggregator = false
    let onlySource = false
    let activeSection = Sections.Aggregator

    switch (mode) {
      case QuickswapModes.only_aggregator:
        activeSection = Sections.Aggregator
        onlyAggregator = true
        break
      case QuickswapModes.only_source:
        activeSection = Sections.Source
        onlySource = true
        break
      case QuickswapModes.aggregator:
        activeSection = Sections.Aggregator
        break
      case QuickswapModes.source:
        activeSection = Sections.Source
    }

    // for testnets API isn't available
    if (externalConfig.entry === 'testnet') {
      activeSection = Sections.Source
      onlySource = true
    }

    this.state = {
      error: null,
      liquidityErrorMessage: '',
      isPending: false,
      isSourceMode: activeSection === Sections.Source,
      onlyAggregator,
      onlySource,
      activeSection,
      needApproveA: false,
      needApproveB: false,
      externalExchangeReference: null,
      externalWindowTimer: null,
      currentLiquidityPair: null,
      fiat: window.DEFAULT_FIAT || activeFiat,
      currencies: currentCurrencies,
      receivedList,
      baseChainWallet,
      spendedCurrency,
      spendedAmount: '',
      fromWallet: fromWallet || {},
      receivedCurrency,
      receivedAmount: '',
      toWallet: toWallet || {},
      sourceAction: Actions.Swap,
      slippage: 0.5,
      userDeadline: 20,
      slippageMaxRange: 100,
      wrongNetwork,
      network:
        externalConfig.evmNetworks[
          spendedCurrency.blockchain || spendedCurrency.value.toUpperCase()
        ],
      swapData: undefined,
      swapFee: '',
      gasPrice: '',
      gasLimit: '',
      showOrders: false,
      blockReason: undefined,
      serviceFee: false,
    }
  }

  componentDidMount() {
    this.updateNetwork()
  }

  componentDidUpdate(prevProps, prevState) {
    const { metamaskData, availableBlockchains } = this.props
    const { metamaskData: prevMetamaskData } = prevProps
    const { wrongNetwork: prevWrongNetwork } = prevState
    const { currencies, spendedCurrency } = this.state

    const chainId = metamask.getChainId()
    const isCurrentNetworkAvailable = !!availableBlockchains[chainId]
    const isSpendedCurrencyNetworkAvailable = metamask.isAvailableNetworkByCurrency(
      spendedCurrency.value
    )
    const switchToCorrectNetwork =
      prevWrongNetwork && (isSpendedCurrencyNetworkAvailable || isCurrentNetworkAvailable)
    const switchToWrongNetwork = !prevWrongNetwork && !isSpendedCurrencyNetworkAvailable
    const disconnect = prevMetamaskData.isConnected && !metamaskData.isConnected

    const needUpdate =
      disconnect ||
      (metamaskData.isConnected &&
        (switchToCorrectNetwork ||
          switchToWrongNetwork ||
          prevMetamaskData.address !== metamaskData.address))

    if (needUpdate) {
      const { currentCurrencies, receivedList, spendedCurrency, receivedCurrency, wrongNetwork } =
        this.returnCurrentAssetState(currencies)

      this.updateBaseChainWallet(spendedCurrency)

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
        network:
          externalConfig.evmNetworks[
            spendedCurrency.blockchain || spendedCurrency.value.toUpperCase()
          ],
        fromWallet,
        toWallet,
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

  updateServiceFeeData = () => {
    const { fromWallet } = this.state

    const feeOptsKey = fromWallet?.standard || fromWallet?.currency
    const currentFeeOpts = externalConfig.opts.fee[feeOptsKey.toLowerCase()]
    const correctFeeRepresentation =
      !Number.isNaN(window?.zeroxFeePercent) &&
      window.zeroxFeePercent >= 0 &&
      window.zeroxFeePercent <= 100

    if (currentFeeOpts?.address && correctFeeRepresentation) {
      // percent of the buyAmount >= 0 && <= 1
      const apiPercentFormat = new BigNumber(window.zeroxFeePercent).dividedBy(MAX_PERCENT)

      this.setState(() => ({
        serviceFee: {
          address: currentFeeOpts.address,
          percent: Number(apiPercentFormat),
        },
      }))
    } else {
      this.setState(() => ({
        serviceFee: false,
      }))
    }
  }

  updateBaseChainWallet = (currencyItem: CurrencyMenuItem) => {
    const { coin, blockchain } = getCoinInfo(currencyItem.value)
    const baseChainWallet = actions.core.getWallet({
      currency: blockchain || coin,
    })

    this.setState(() => ({
      baseChainWallet,
    }))
  }

  updateNetwork = async () => {
    const { spendedCurrency } = this.state

    const network =
      externalConfig.evmNetworks[spendedCurrency.blockchain || spendedCurrency.value.toUpperCase()]

    this.updateBaseChainWallet(spendedCurrency)

    this.setState(
      () => ({
        network,
      }),
      async () => {
        await this.updateCurrentPairAddress()
      }
    )
  }

  updateWallets = () => {
    const { spendedCurrency, receivedCurrency } = this.state

    this.updateBaseChainWallet(spendedCurrency)

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
      const currentSpendedAsset = item.value === spendedCurrency?.value
      const spendedAssetChain = item.blockchain || item.value.toUpperCase()
      const receivedAssetChain =
        spendedCurrency?.blockchain || spendedCurrency?.value?.toUpperCase()

      return spendedAssetChain === receivedAssetChain && !currentSpendedAsset
    })

    return result
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

    this.setState(
      () => ({
        receivedList,
        receivedCurrency: receivedList[0],
        toWallet: actions.core.getWallet({ currency: receivedList[0].value }),
      }),
      async () => {
        this.resetSwapData()
      }
    )
  }

  reportError = (error: IError) => {
    const { liquidityErrorMessage } = this.state
    const possibleNoLiquidity = JSON.stringify(error)?.match(/INSUFFICIENT_ASSET_LIQUIDITY/)
    const insufficientSlippage = JSON.stringify(error)?.match(/IncompleteTransformERC20Error/)
    const notEnoughBalance = error.message?.match(/(N|n)ot enough .* balance/)

    if (possibleNoLiquidity) {
      this.setBlockReason(BlockReasons.NoLiquidity)
    } else if (insufficientSlippage) {
      this.setBlockReason(BlockReasons.InsufficientSlippage)
    } else if (notEnoughBalance) {
      this.setBlockReason(BlockReasons.NoBalance)
    } else if (liquidityErrorMessage) {
      this.setBlockReason(BlockReasons.Liquidity)
    } else {
      this.setBlockReason(BlockReasons.Unknown)

      console.group('%c Swap', 'color: red;')
      console.error(error)
      console.groupEnd()
    }

    this.setState(() => ({
      isPending: false,
      error,
    }))
  }

  createSwapRequest = (skipValidation = false) => {
    const { slippage, spendedAmount, fromWallet, toWallet, serviceFee } = this.state

    const sellToken = fromWallet?.contractAddress || ADDRESSES.EVM_COIN_ADDRESS
    const buyToken = toWallet?.contractAddress || ADDRESSES.EVM_COIN_ADDRESS

    const sellAmount = utils.amount.formatWithDecimals(
      spendedAmount,
      fromWallet.decimals || COIN_DECIMALS
    )

    const request = [
      `/swap/v1/quote?`,
      `takerAddress=${fromWallet.address}&`,
      `buyToken=${buyToken}&`,
      `sellToken=${sellToken}&`,
      `sellAmount=${sellAmount}`,
    ]

    if (window?.STATISTICS_ENABLED) {
      request.push(`&affiliateAddress=${externalConfig.swapContract.affiliateAddress}`)
    }

    if (serviceFee) {
      const { address, percent } = serviceFee

      request.push(`&feeRecipient=${address}`)
      request.push(`&buyTokenPercentageFee=${percent}`)
    }

    if (skipValidation) {
      request.push(`&skipValidation=true`)
    }

    if (slippage) {
      // allow users to enter an amount up to 100, because it's more easy then enter the amount from 0 to 1
      // and now convert it into the api format
      const correctValue = new BigNumber(slippage).dividedBy(MAX_PERCENT)

      request.push(`&slippagePercentage=${correctValue}`)
    }

    return request.join('')
  }

  onInputDataChange = async () => {
    const { activeSection, sourceAction, currentLiquidityPair } = this.state

    await this.updateCurrentPairAddress()
    await this.checkApprove(Direction.Spend)

    if (activeSection === Sections.Source && sourceAction === Actions.AddLiquidity) {
      await this.checkApprove(Direction.Receive)
    }

    if (
      activeSection === Sections.Source &&
      sourceAction !== Actions.AddLiquidity &&
      currentLiquidityPair
    ) {
      this.resetSwapData()
    }

    this.setState(() => ({
      error: null,
    }))

    if (activeSection === Sections.Aggregator) {
      await this.fetchSwapAPIData()
    } else if (activeSection === Sections.Source) {
      await this.processingSourceActions()
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
    const { baseChainWallet, toWallet, gasLimit, gasPrice } = this.state
    const { swap, withoutValidation } = params

    // we've had a special error in the previous request. It means there is
    // some problem and we add a "skip validation" parameter to bypass it.
    // Usually the swap tx with this parameter fails in the blockchain,
    // because it's not enough gas limit. Estimate it by yourself
    if (withoutValidation) {
      const estimatedGas = await actions[baseChainWallet.currency.toLowerCase()]?.estimateGas(swap)

      if (typeof estimatedGas === 'number') {
        swap.gas = estimatedGas
      } else if (estimatedGas instanceof Error) {
        this.reportError(estimatedGas)
      }
    }

    const customGasLimit = gasLimit && gasLimit > swap.gas ? gasLimit : swap.gas
    const customGasPrice = gasPrice
      ? utils.amount.formatWithDecimals(gasPrice, GWEI_DECIMALS)
      : swap.gasPrice

    const weiFee = new BigNumber(customGasLimit).times(customGasPrice)
    const swapFee = utils.amount.formatWithoutDecimals(weiFee, COIN_DECIMALS)
    const receivedAmount = utils.amount.formatWithoutDecimals(
      swap.buyAmount,
      toWallet?.decimals || COIN_DECIMALS
    )

    this.setState(() => ({
      receivedAmount,
      swapData: swap,
      swapFee,
      isPending: false,
    }))
  }

  fetchSwapAPIData = async () => {
    const { network, needApproveA } = this.state
    const doNotUpdate = this.isApiRequestBlocking() || needApproveA

    if (doNotUpdate) return

    this.setState(() => ({
      isPending: true,
      blockReason: undefined,
    }))

    let repeatRequest = true
    let swapRequest = this.createSwapRequest()

    while (repeatRequest) {
      const swap: any = await apiLooper.get(API_NAME[network.networkVersion], swapRequest, {
        reportErrors: (error) => {
          if (!repeatRequest) {
            this.reportError(error)
          }
        },
        sourceError: true,
      })

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

  updateCurrentPairAddress = async () => {
    const { network, baseChainWallet, fromWallet, toWallet } = this.state
    const tokenA = fromWallet?.contractAddress || ADDRESSES.EVM_COIN_ADDRESS
    const tokenB = toWallet?.contractAddress || ADDRESSES.EVM_COIN_ADDRESS

    let pairAddress = cacheStorageGet(
      'quickswapLiquidityPair',
      `${externalConfig.entry}_${tokenA}_${tokenB}`
    )

    if (!pairAddress) {
      pairAddress = await actions.uniswap.getPairAddress({
        baseCurrency: baseChainWallet.currency,
        chainId: network.networkVersion,
        factoryAddress: LIQUIDITY_SOURCE_DATA[network.networkVersion]?.factory,
        tokenA,
        tokenB,
      })

      const SECONDS = 15

      cacheStorageSet(
        'quickswapLiquidityPair',
        `${externalConfig.entry}_${tokenA}_${tokenB}`,
        pairAddress,
        SECONDS
      )
    }

    const noLiquidityPair = pairAddress === ZERO_ADDRESS

    this.setState(() => ({
      currentLiquidityPair: noLiquidityPair ? null : pairAddress,
      blockReason: noLiquidityPair ? BlockReasons.PairDoesNotExist : undefined,
    }))
  }

  processingSourceActions = async () => {
    const { sourceAction, currentLiquidityPair } = this.state

    if (!currentLiquidityPair) return

    switch (sourceAction) {
      case Actions.Swap:
        await this.fetchAmountOut()
        break
      case Actions.AddLiquidity:
        await this.fetchLiquidityData()
    }
  }

  fetchAmountOut = async () => {
    const { network, baseChainWallet, spendedAmount, fromWallet, toWallet } = this.state

    const tokenA = fromWallet.contractAddress ?? EVM_COIN_ADDRESS
    const tokenB = toWallet.contractAddress ?? EVM_COIN_ADDRESS

    this.setPending(true)

    try {
      const amountOut = await actions.uniswap.getAmountOut({
        routerAddress: LIQUIDITY_SOURCE_DATA[network.networkVersion]?.router,
        baseCurrency: baseChainWallet.currency,
        chainId: network.networkVersion,
        tokenA,
        tokenADecimals: fromWallet.decimals ?? COIN_DECIMALS,
        amountIn: spendedAmount,
        tokenB,
        tokenBDecimals: toWallet.decimals ?? COIN_DECIMALS,
      })

      this.setState(() => ({
        receivedAmount: amountOut,
      }))
    } catch (error) {
      this.reportError(error)
    } finally {
      this.setPending(false)
    }
  }

  fetchLiquidityData = async () => {
    const { network, spendedAmount, baseChainWallet, currentLiquidityPair, fromWallet, toWallet } =
      this.state

    this.setPending(true)

    try {
      const result = await actions.uniswap.getLiquidityAmountForAssetB({
        chainId: network.networkVersion,
        pairAddress: currentLiquidityPair,
        routerAddress: LIQUIDITY_SOURCE_DATA[network.networkVersion]?.router,
        baseCurrency: baseChainWallet.currency,
        tokenA: fromWallet.contractAddress ?? EVM_COIN_ADDRESS,
        amountADesired: spendedAmount,
        tokenADecimals: fromWallet.decimals ?? COIN_DECIMALS,
        tokenBDecimals: toWallet.decimals ?? COIN_DECIMALS,
      })

      this.setState(() => ({
        receivedAmount: result,
      }))
    } catch (error) {
      this.reportError(error)
    } finally {
      this.setPending(false)
    }
  }

  setSpendedAmount = (value) => {
    this.setState(() => ({
      spendedAmount: value,
    }))
  }

  setReceivedAmount = (value) => {
    this.setState(() => ({
      receivedAmount: value,
    }))
  }

  resetReceivedAmount = () => {
    this.setState(() => ({
      receivedAmount: '',
    }))
  }

  resetSwapData = () => {
    this.setState(() => ({ swapData: undefined }))
    this.resetReceivedAmount()
  }

  checkApprove = async (direction) => {
    const { network, isSourceMode, spendedAmount, receivedAmount, fromWallet, toWallet } =
      this.state

    let amount = spendedAmount
    let wallet = fromWallet
    const spender = isSourceMode
      ? LIQUIDITY_SOURCE_DATA[network.networkVersion]?.router
      : externalConfig.swapContract.zerox

    if (direction === Direction.Receive) {
      amount = receivedAmount
      wallet = toWallet
    }

    if (!wallet.isToken) {
      this.setNeedApprove(direction, false)
    } else {
      const { standard, address, contractAddress, decimals } = wallet
      const allowance = await erc20Like[standard].checkAllowance({
        contract: contractAddress,
        owner: address,
        decimals,
        spender,
      })

      if (amount) {
        this.setNeedApprove(direction, new BigNumber(amount).isGreaterThan(allowance))
      }
    }
  }

  setNeedApprove = (direction, value) => {
    if (direction === Direction.Spend) {
      this.setState(() => ({ needApproveA: value }))
    } else {
      this.setState(() => ({ needApproveB: value }))
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
        this.updateServiceFeeData()
        await this.onInputDataChange()
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
        await this.onInputDataChange()
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
        await this.onInputDataChange()
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
      this.setPending(true)

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

    this.setPending(false)
  }

  clearWindowTimer = () => {
    const { externalWindowTimer } = this.state

    if (externalWindowTimer) {
      clearInterval(externalWindowTimer)
    }
  }

  openAggregatorSection = () => {
    this.setState(() => ({
      activeSection: Sections.Aggregator,
      isSourceMode: false,
      receivedAmount: '',
    }))
  }

  openSourceSection = () => {
    this.setState(() => ({
      activeSection: Sections.Source,
      isSourceMode: true,
      receivedAmount: '',
      swapData: undefined,
    }))
  }

  openSettingsSection = () => {
    this.setState(() => ({
      activeSection: Sections.Settings,
    }))
  }

  setAction = (type) => {
    this.resetSwapData()

    this.setState(() => ({
      spendedAmount: '',
      sourceAction: type,
    }))
  }

  mnemonicIsSaved = () => {
    return localStorage.getItem(constants.privateKeyNames.twentywords) === '-'
  }

  setPending = (value: boolean) => {
    this.setState(() => ({
      isPending: value,
    }))
  }

  setBlockReason = (value: BlockReasons) => {
    this.setState(() => ({
      blockReason: value,
    }))
  }

  resetSpendedAmount = () => {
    this.setState(() => ({
      spendedAmount: '',
    }))
  }

  isApiRequestBlocking = () => {
    const {
      isPending,
      spendedAmount,
      fromWallet,
      baseChainWallet,
      slippage,
      slippageMaxRange,
      gasPrice,
      gasLimit,
    } = this.state

    const wrongSlippage =
      slippage &&
      (new BigNumber(slippage).isEqualTo(0) ||
        new BigNumber(slippage).isGreaterThan(slippageMaxRange))

    const wrongGasPrice =
      new BigNumber(gasPrice).isPositive() &&
      new BigNumber(gasPrice).isGreaterThan(API_GAS_LIMITS.MAX_PRICE)

    const wrongGasLimit =
      new BigNumber(gasLimit).isPositive() &&
      (new BigNumber(gasLimit).isLessThan(API_GAS_LIMITS.MIN_LIMIT) ||
        new BigNumber(gasLimit).isGreaterThan(API_GAS_LIMITS.MAX_LIMIT))

    const wrongSettings = wrongGasPrice || wrongGasLimit || wrongSlippage
    const noBalance =
      baseChainWallet.balanceError || new BigNumber(baseChainWallet.balance).isEqualTo(0)

    return (
      noBalance ||
      isPending ||
      wrongSettings ||
      new BigNumber(spendedAmount).isNaN() ||
      new BigNumber(spendedAmount).isEqualTo(0) ||
      new BigNumber(spendedAmount).isGreaterThan(fromWallet.balance)
    )
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
    const { history } = this.props
    const {
      baseChainWallet,
      activeSection,
      isSourceMode,
      onlyAggregator,
      onlySource,
      needApproveA,
      needApproveB,
      fiat,
      spendedAmount,
      spendedCurrency,
      receivedAmount,
      fromWallet,
      toWallet,
      receivedCurrency,
      sourceAction,
      wrongNetwork,
      network,
      swapData,
      swapFee,
      showOrders,
      blockReason,
      slippage,
      serviceFee,
    } = this.state

    const linked = Link.all(
      this,
      'slippage',
      'gasPrice',
      'gasLimit',
      'userDeadline',
      'spendedAmount',
      'receivedAmount'
    )

    const insufficientBalanceA =
      new BigNumber(fromWallet.balance).isEqualTo(0) ||
      new BigNumber(spendedAmount)
        .plus(fromWallet?.standard ? 0 : swapFee || 0)
        .isGreaterThan(fromWallet.balance)

    const insufficientBalanceB =
      new BigNumber(toWallet.balance).isEqualTo(0) ||
      new BigNumber(receivedAmount).isGreaterThan(toWallet.balance)

    return (
      <>
        {onlyAggregator && <TokenInstruction />}

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
          <Header
            network={network}
            onlyAggregator={onlyAggregator}
            onlySource={onlySource}
            activeSection={activeSection}
            wrongNetwork={wrongNetwork}
            receivedCurrency={receivedCurrency}
            openAggregatorSection={this.openAggregatorSection}
            openSourceSection={this.openSourceSection}
            openSettingsSection={this.openSettingsSection}
          />

          {activeSection === Sections.Settings ? (
            <Settings
              isSourceMode={isSourceMode}
              stateReference={linked}
              onInputDataChange={this.onInputDataChange}
              resetSwapData={this.resetSwapData}
              slippage={slippage}
            />
          ) : (
            <>
              <div styleName={`${wrongNetwork ? 'disabled' : ''}`}>
                <InputForm
                  parentState={this.state}
                  stateReference={linked}
                  selectCurrency={this.selectCurrency}
                  flipCurrency={this.flipCurrency}
                  openExternalExchange={this.openExternalExchange}
                  onInputDataChange={this.onInputDataChange}
                  setSpendedAmount={this.setSpendedAmount}
                  updateWallets={this.updateWallets}
                  insufficientBalanceA={insufficientBalanceA}
                  insufficientBalanceB={insufficientBalanceB}
                  resetReceivedAmount={this.resetReceivedAmount}
                  setReceivedAmount={this.setReceivedAmount}
                />
              </div>

              {activeSection === Sections.Source && (
                <SourceActions sourceAction={sourceAction} setAction={this.setAction} />
              )}

              <UserInfo
                history={history}
                isSourceMode={isSourceMode}
                slippage={slippage}
                network={network}
                swapData={swapData}
                swapFee={swapFee}
                spendedAmount={spendedAmount}
                baseChainWallet={baseChainWallet}
                fromWallet={fromWallet}
                toWallet={toWallet}
                fiat={fiat}
                serviceFee={serviceFee}
              />

              <Feedback
                isSourceMode={isSourceMode}
                wrongNetwork={wrongNetwork}
                insufficientBalanceA={insufficientBalanceA}
                blockReason={blockReason}
                baseChainWallet={baseChainWallet}
                spendedAmount={spendedAmount}
                needApproveA={needApproveA}
                needApproveB={needApproveB}
                spendedCurrency={spendedCurrency}
                receivedCurrency={receivedCurrency}
                sourceAction={sourceAction}
              />

              <Footer
                parentState={this.state}
                isSourceMode={isSourceMode}
                sourceAction={sourceAction}
                reportError={this.reportError}
                setBlockReason={this.setBlockReason}
                resetSwapData={this.resetSwapData}
                resetSpendedAmount={this.resetSpendedAmount}
                isApiRequestBlocking={this.isApiRequestBlocking}
                insufficientBalanceA={insufficientBalanceA}
                insufficientBalanceB={insufficientBalanceB}
                setPending={this.setPending}
                onInputDataChange={this.onInputDataChange}
                baseChainWallet={baseChainWallet}
              />
            </>
          )}

          {/*
          Maybe fix some problems with 1inch orders and uncomment all related to orders code
          or the better way is to complete this issue first and enable orders again:
          https://github.com/swaponline/MultiCurrencyWallet/issues/4896
          */}
          {/* {!wrongNetwork && (this.mnemonicIsSaved() || metamask.isConnected()) && (
            <Button onClick={this.createLimitOrder} link small>
              <FormattedMessage id="createLimitOrder" defaultMessage="Create limit order" />
            </Button>
          )} */}
        </section>

        {!isSourceMode && (
          <p styleName="externalServiceWarning">
            <FormattedMessage
              id="disclaimerAbout0x"
              defaultMessage="* Disclaimer: the exchange uses a 3rd 0x Liquidity Protocol. Be careful and use at your own risk."
            />
          </p>
        )}

        {/* <Button id="limitOrdersOrderbookBtn" onClick={this.toggleOrdersViability} link>
          <FormattedMessage id="limitOrders" defaultMessage="Limit orders" />
        </Button>

        {showOrders && <LimitOrders />} */}
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
