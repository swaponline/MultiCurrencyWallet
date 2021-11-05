import { PureComponent } from 'react'
import { connect } from 'redaction'
import { BigNumber } from 'bignumber.js'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import utils from 'common/utils'
import ADDRESSES, { EVM_COIN_ADDRESS, ZERO_ADDRESS } from 'common/helpers/constants/ADDRESSES'
import { apiLooper, externalConfig, constants, localStorage, metamask, links, user } from 'helpers'
import { localisedUrl } from 'helpers/locale'
import actions from 'redux/actions'
import Link from 'local_modules/sw-valuelink'
import { ComponentState, Direction, BlockReasons, Sections, Actions } from './types'
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

class QuickSwap extends PureComponent<IUniversalObj, ComponentState> {
  constructor(props) {
    super(props)

    const { match, activeFiat, allCurrencies, history } = props
    const { params, path } = match

    let { currentCurrencies, receivedList, spendedCurrency, receivedCurrency, wrongNetwork } =
      this.returnCurrentAssetState(allCurrencies)

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

    const activeSection = externalConfig.entry === 'mainnet' ? Sections.Aggregator : Sections.Source

    this.state = {
      error: null,
      liquidityErrorMessage: '',
      isPending: false,
      router: null,
      factory: null,
      isSourceMode: activeSection === Sections.Source,
      activeSection,
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
        network:
          externalConfig.evmNetworks[
            spendedCurrency.blockchain || spendedCurrency.value.toUpperCase()
          ],
        baseChainWallet,
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

  updateNetwork = async () => {
    const { spendedCurrency, fromWallet } = this.state

    const baseChainWallet = actions.core.getWallet({
      currency: spendedCurrency.blockchain,
    })
    const network =
      externalConfig.evmNetworks[spendedCurrency.blockchain || spendedCurrency.value.toUpperCase()]

    const router = actions.uniswap.getContract({
      name: 'router',
      address: LIQUIDITY_SOURCE_DATA[network.networkVersion]?.router,
      baseCurrency: baseChainWallet.currency,
    })
    const factory = actions.uniswap.getContract({
      name: 'factory',
      address: LIQUIDITY_SOURCE_DATA[network.networkVersion]?.factory,
      baseCurrency: baseChainWallet.currency,
    })

    this.setState(() => ({
      router,
      factory,
      network,
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

    this.setState(() => ({
      receivedList,
      receivedCurrency: receivedList[0],
      toWallet: actions.core.getWallet({ currency: receivedList[0].value }),
    }))
    this.resetSwapData()
  }

  reportError = (error: IError) => {
    const { liquidityErrorMessage } = this.state
    const possibleNoLiquidity = JSON.stringify(error)?.match(/INSUFFICIENT_ASSET_LIQUIDITY/)
    const insufficientSlippage = JSON.stringify(error)?.match(/IncompleteTransformERC20Error/)
    const notEnoughBalance = error.message?.match(/(N|n)ot enough .* balance/)

    if (possibleNoLiquidity) {
      this.setState(() => ({ blockReason: BlockReasons.NoLiquidity }))
    } else if (insufficientSlippage) {
      this.setState(() => ({ blockReason: BlockReasons.InsufficientSlippage }))
    } else if (notEnoughBalance) {
      this.setState(() => ({ blockReason: BlockReasons.NoBalance }))
    } else if (liquidityErrorMessage) {
      this.setState(() => ({ blockReason: BlockReasons.Liquidity }))
    } else {
      this.setState(() => ({ blockReason: BlockReasons.Unknown }))

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
    const { slippage, spendedAmount, fromWallet, toWallet } = this.state

    const sellToken = fromWallet?.contractAddress ?? ADDRESSES.EVM_COIN_ADDRESS
    const buyToken = toWallet?.contractAddress ?? ADDRESSES.EVM_COIN_ADDRESS

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
    const { activeSection } = this.state

    if (activeSection === Sections.Aggregator) {
      await this.checkTokenApprove()
    }

    const { needApprove } = this.state
    const doNotUpdate = this.isProcessBlocking() || needApprove

    this.resetSwapData()
    this.setState(() => ({
      error: null,
      blockReason: undefined,
    }))

    if (doNotUpdate) return

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
    const { network } = this.state

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

  isPairExist = async () => {
    const { network, baseChainWallet, fromWallet, toWallet } = this.state

    const pairAddress = await actions.uniswap.getPairAddress({
      baseCurrency: baseChainWallet.currency,
      chainId: network.networkVersion,
      factoryAddress: LIQUIDITY_SOURCE_DATA[network.networkVersion]?.factory,
      tokenA: fromWallet?.contractAddress ?? ADDRESSES.EVM_COIN_ADDRESS,
      tokenB: toWallet?.contractAddress ?? ADDRESSES.EVM_COIN_ADDRESS,
    })

    console.log('%c isPairExist', 'color:orange;font-size:20px')
    console.log('this.state: ', this.state)
    console.log('pairAddress: ', pairAddress)

    return pairAddress !== ZERO_ADDRESS
  }

  processingSourceActions = async () => {
    const { sourceAction } = this.state
    const isPairExist = await this.isPairExist()

    // can not swap or remove liquidity with a current pair
    if (!isPairExist && sourceAction !== Actions.AddLiquidity) {
      this.setState(() => ({
        blockReason: BlockReasons.PairDoesNotExist,
      }))
      return
    }

    switch (sourceAction) {
      case Actions.Swap:
        await this.fetchSwapData()
        break
      case Actions.AddLiquidity:
        break
      case Actions.RemoveLiquidity:
    }
  }

  fetchSwapData = async () => {
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
        isPending: false,
      }))
    } catch (error) {
      this.reportError(error)
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

  checkTokenApprove = async () => {
    const { spendedAmount, fromWallet } = this.state

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
    }))
  }

  openSourceSection = () => {
    this.setState(() => ({
      activeSection: Sections.Source,
      isSourceMode: true,
    }))
  }

  openSettingsSection = () => {
    this.setState(() => ({
      activeSection: Sections.Settings,
    }))
  }

  setAction = (type) => {
    this.setState(() => ({
      sourceAction: type,
    }))
  }

  mnemonicIsSaved = () => {
    const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)

    return mnemonic === '-'
  }

  setPending = (value: boolean) => {
    this.setState(() => ({
      isPending: value,
    }))
  }

  setNeedApprove = (value) => {
    this.setState(() => ({
      needApprove: value,
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

  isProcessBlocking = () => {
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
      currencies,
      receivedList,
      baseChainWallet,
      isPending,
      isSourceMode,
      needApprove,
      fiat,
      spendedAmount,
      spendedCurrency,
      fromWallet,
      toWallet,
      receivedCurrency,
      sourceAction,
      wrongNetwork,
      network,
      swapData,
      swapFee,
      activeSection,
      showOrders,
      blockReason,
      slippage,
      router,
      factory,
      liquidityErrorMessage,
    } = this.state

    const linked = Link.all(
      this,
      'fiatAmount',
      'spendedAmount',
      'receivedAmount',
      'slippage',
      'gasPrice',
      'gasLimit',
      'userDeadline'
    )

    const insufficientBalance =
      new BigNumber(fromWallet.balance).isEqualTo(0) ||
      new BigNumber(spendedAmount)
        .plus(fromWallet?.standard ? 0 : swapFee || 0)
        .isGreaterThan(fromWallet.balance)

    return (
      <>
        <TokenInstruction />

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
                  stateReference={linked}
                  isSourceMode={isSourceMode}
                  selectCurrency={this.selectCurrency}
                  flipCurrency={this.flipCurrency}
                  openExternalExchange={this.openExternalExchange}
                  onInputDataChange={this.onInputDataChange}
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
                isPending={isPending}
              />

              <Feedback
                wrongNetwork={wrongNetwork}
                insufficientBalance={insufficientBalance}
                blockReason={blockReason}
                baseChainWallet={baseChainWallet}
                spendedAmount={spendedAmount}
                needApprove={needApprove}
                spendedCurrency={spendedCurrency}
              />

              <Footer
                parentState={this.state}
                isSourceMode={isSourceMode}
                sourceAction={sourceAction}
                reportError={this.reportError}
                setBlockReason={this.setBlockReason}
                resetSwapData={this.resetSwapData}
                resetSpendedAmount={this.resetSpendedAmount}
                isProcessBlocking={this.isProcessBlocking}
                insufficientBalance={insufficientBalance}
                fetchSwapAPIData={this.fetchSwapAPIData}
                setPending={this.setPending}
                setNeedApprove={this.setNeedApprove}
                router={router}
                factory={factory}
              />
            </>
          )}

          {!wrongNetwork && (this.mnemonicIsSaved() || metamask.isConnected()) && (
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
