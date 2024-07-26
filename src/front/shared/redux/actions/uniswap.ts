import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { abi as FactoryV2ABI } from '@uniswap/v2-periphery/build/IUniswapV2Factory.json'
import { abi as RouterV2ABI } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import { abi as PairV2ABI } from '@uniswap/v2-periphery/build/IUniswapV2Pair.json'
import ethLikeHelper from 'common/helpers/ethLikeHelper'
import constants from 'common/helpers/constants'
import utils from 'common/utils'
import actions from 'redux/actions'

import config from 'helpers/externalConfig'

import { abi as FactoryV3ABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json'
import { abi as QuoterV3ABI } from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'
import { abi as SwapRouterV3ABI } from '@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json'
import { Interface as AbiInterface } from '@ethersproject/abi'


const ABIS = {
  factory: FactoryV2ABI,
  router: RouterV2ABI,
  pair: PairV2ABI,
  
  factory_v3: FactoryV3ABI,
  quoter_v3: QuoterV3ABI,
  router_v3: SwapRouterV3ABI,
}

enum SwapMethods {
  swapExactETHForTokens = 'swapExactETHForTokens',
  swapExactTokensForETH = 'swapExactTokensForETH',
  swapExactTokensForTokens = 'swapExactTokensForTokens',
  swapTokensForExactTokens = 'swapTokensForExactTokens',
  swapExactETHForTokensSupportingFeeOnTransferTokens = 'swapExactETHForTokensSupportingFeeOnTransferTokens',
  swapExactTokensForETHSupportingFeeOnTransferTokens = 'swapExactTokensForETHSupportingFeeOnTransferTokens',
  swapExactTokensForTokensSupportingFeeOnTransferTokens = 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
}

enum LiquidityMethods {
  addLiquidity = 'addLiquidity',
  addLiquidityETH = 'addLiquidityETH',
  removeLiquidity = 'removeLiquidity',
  removeLiquidityETH = 'removeLiquidityETH',
}

type GetContractParams = {
  name: 'factory' | 'router' | 'pair' | 'factory_v3' | 'quoter_v3' | 'router_v3'
  address: string
  baseCurrency: string
}

// V3 - from https://github.com/Uniswap/v3-core/blob/main/contracts/libraries/TickMath.sol
const TickMath_MIN_SQRT_RATIO = '4295128739'
const TickMath_MAX_SQRT_RATIO = '1461446703485210103287273052203988822378723970342'


const wrapCurrency = (chainId: number, currencyAddress: string) => {
  const { WrapperCurrency, EVM_COIN_ADDRESS } = constants.ADDRESSES

  return currencyAddress === EVM_COIN_ADDRESS ? WrapperCurrency[chainId] : currencyAddress
}

const getContract = (params: GetContractParams) => {
  const { name, address, baseCurrency } = params

  return ethLikeHelper[baseCurrency?.toLowerCase()]?.getContract({
    abi: ABIS[name],
    address,
  })
}

const getDeadline = async (provider, deadlinePeriod): Promise<string> => {
  const latestBlockNumber = await provider.eth.getBlockNumber()
  const latestBlock = await provider.eth.getBlock(latestBlockNumber)
  const timestamp = latestBlock.timestamp

  return utils.amount.toHexNumber(new BigNumber(timestamp).plus(deadlinePeriod))
}

const getSlippageRange = (slippagePercent, amount) => {
  const MAX_PERCENT = 100

  return new BigNumber(amount).div(MAX_PERCENT).times(slippagePercent).toNumber()
}

const getMinAmount = (amount, range) => {
  return new BigNumber(amount).minus(range).integerValue(BigNumber.ROUND_CEIL)
}

const getPairAddress = async (params) => {
  const { factoryAddress, baseCurrency, chainId } = params
  let { tokenA, tokenB } = params
console.log('>>> getPairAddress', params)
  const factory = getContract({
    name: 'factory',
    address: factoryAddress,
    baseCurrency,
  })

  tokenA = wrapCurrency(chainId, tokenA)
  tokenB = wrapCurrency(chainId, tokenB)

  try {
    return await factory?.methods.getPair(tokenA, tokenB).call()
  } catch (error) {
    console.error(error)
    return false
  }
}

const getPoolAddressV3 = async (params) => {
  const { baseCurrency, chainId } = params
  let { tokenA, tokenB, fee } = params

  const factory = getContract({
    name: 'factory_v3',
    address: config?.UNISWAP_V3_CONTRACTS[chainId]?.factory,
    baseCurrency,
  })

  tokenA = wrapCurrency(chainId, tokenA)
  tokenB = wrapCurrency(chainId, tokenB)

  try {
    const poolAddress = await factory?.methods.getPool(tokenA, tokenB, fee || 10000).call()
    console.log('>>>> V3 PoolAddress ', poolAddress)
    return poolAddress
  } catch (error) {
    console.error(error)
    return false
  }
}
window.getPoolAddressV3 = getPoolAddressV3

const getAmountOutV3 = async (params) => {
  const {
    baseCurrency,
    chainId,
    tokenA,
    tokenADecimals,
    tokenB,
    tokenBDecimals,
    amountIn,
    fee,
  } = params
  
  const quoterContract = getContract({
    name: 'quoter_v3',
    address: config?.UNISWAP_V3_CONTRACTS[chainId]?.quoter,
    baseCurrency,
  })

  const wrappedTokenA = wrapCurrency(chainId, tokenA)
  const wrappedTokenB = wrapCurrency(chainId, tokenB)

  const unitAmountIn = utils.amount.formatWithDecimals(amountIn, tokenADecimals)

  const callParams = [
    wrappedTokenA,
    wrappedTokenB,
    fee || 10000,
    unitAmountIn,
    0
  ]
  const quotedAmountOut = await quoterContract?.methods.quoteExactInputSingle(...callParams).call()
  return utils.amount.formatWithoutDecimals(quotedAmountOut, tokenBDecimals)
}
window.getAmountOutV3 = getAmountOutV3

const calcPriceV3 = (params) => {
  const {
    sqrtPriceX96,
    Decimal0,
    Decimal1,
  } = params
  // @ts-ignore
  const buyOneOfToken0 = ((sqrtPriceX96 / 2**96)**2) / (10**Decimal1 / 10**Decimal0).toFixed(Decimal1);
  // @ts-ignore
  const buyOneOfToken1 = (1 / buyOneOfToken0).toFixed(Decimal0);
  // console.log("price of token0 in value of token1 : " + buyOneOfToken0.toString());
  // console.log("price of token1 in value of token0 : " + buyOneOfToken1.toString());
  // console.log("");
  // @ts-ignore
  const buyOneOfToken0Wei =(Math.floor(buyOneOfToken0 * (10**Decimal1))).toLocaleString('fullwide', {useGrouping:false});
  // @ts-ignore
  const buyOneOfToken1Wei =(Math.floor(buyOneOfToken1 * (10**Decimal0))).toLocaleString('fullwide', {useGrouping:false});
  // console.log("price of token0 in value of token1 in lowest decimal : " + buyOneOfToken0Wei);
  // console.log("price of token1 in value of token1 in lowest decimal : " + buyOneOfToken1Wei);
  // console.log("");
  return {
    buyOneOfToken0,
    buyOneOfToken1,
    buyOneOfToken0Wei,
    buyOneOfToken1Wei,
  }
}


const getAmountOut = async (params) => {
  const {
    routerAddress,
    baseCurrency,
    chainId,
    tokenA,
    tokenADecimals,
    tokenB,
    tokenBDecimals,
    amountIn,
  } = params
console.log('>>> getAmountOut', params)
  const router = getContract({ name: 'router', address: routerAddress, baseCurrency })
  const unitAmountIn = utils.amount.formatWithDecimals(amountIn, tokenADecimals)
  const path = [wrapCurrency(chainId, tokenA), wrapCurrency(chainId, tokenB)]

  try {
    // use getAmountsOut instead of getAmountOut, because we don't need
    // to request pair reserves manually for the second method arguments
    const amounts = await router?.methods
      .getAmountsOut(utils.amount.toHexNumber(unitAmountIn), path)
      .call()

    return utils.amount.formatWithoutDecimals(amounts[1], tokenBDecimals)
  } catch (error) {
    return error
  }
}

const getLiquidityAmountForAssetB = async (params) => {
  const {
    chainId,
    pairAddress,
    routerAddress,
    baseCurrency,
    amountADesired,
    tokenADecimals,
    tokenBDecimals,
  } = params
  let { tokenA } = params

  tokenA = wrapCurrency(chainId, tokenA)

  const router = getContract({ name: 'router', address: routerAddress, baseCurrency })
  const pair = getContract({ name: 'pair', address: pairAddress, baseCurrency })

  try {
    const token1 = await pair.methods.token1().call()
    const { reserve0, reserve1 } = await pair.methods.getReserves().call()
    const unitAmountA = utils.amount.formatWithDecimals(amountADesired, tokenADecimals)

    const reservesOrder =
      tokenA.toLowerCase() === token1.toLowerCase() ? [reserve1, reserve0] : [reserve0, reserve1]

    const tokenBAmount = await router.methods.quote(unitAmountA, ...reservesOrder).call()

    return utils.amount.formatWithoutDecimals(tokenBAmount, tokenBDecimals)
  } catch (error) {
    return error
  }
}

const returnSwapDataByMethod = async (
  params
): Promise<{
  args: any[]
  value?: string
}> => {
  let {
    chainId,
    provider,
    method,
    fromToken,
    fromTokenDecimals,
    toToken,
    toTokenDecimals,
    owner,
    deadlinePeriod,
    slippage,
    sellAmount,
    buyAmount,
  } = params

  if (!SwapMethods[method]) throw new Error('Wrong method')

  const chainNumber = Number(chainId)

  // Swaps available only for tokens. Replace native currency with a wrapped one
  fromToken = wrapCurrency(chainNumber, fromToken)
  toToken = wrapCurrency(chainNumber, toToken)

  const path = [fromToken, toToken]
  const deadline = await getDeadline(provider, deadlinePeriod)

  const weiSellAmount = utils.amount.formatWithDecimals(sellAmount, fromTokenDecimals)
  const weiBuyAmount = utils.amount.formatWithDecimals(buyAmount, toTokenDecimals)
  const buySlilppageRange = getSlippageRange(slippage, weiBuyAmount)

  // the minimum amount of the purchased asset to be received
  const intOutMin = getMinAmount(weiBuyAmount, buySlilppageRange)
  const amountOutMin = utils.amount.toHexNumber(intOutMin)
  const amountIn = weiSellAmount

  switch (method) {
    case SwapMethods.swapExactETHForTokensSupportingFeeOnTransferTokens:
    case SwapMethods.swapExactETHForTokens:
      return {
        args: [amountOutMin, path, owner, deadline],
        // without decimals and not in hex format, because we do it in the actions
        value: sellAmount,
      }

    case SwapMethods.swapExactTokensForTokensSupportingFeeOnTransferTokens:
    case SwapMethods.swapExactTokensForETHSupportingFeeOnTransferTokens:
    case SwapMethods.swapExactTokensForETH:
    case SwapMethods.swapExactTokensForTokens:
      return {
        args: [amountIn, amountOutMin, path, owner, deadline],
      }
  }

  return { args: [] }
}

const returnSwapMethod = (params) => {
  const { fromToken, toToken, useFeeOnTransfer } = params

  if (
    fromToken.toLowerCase() === constants.ADDRESSES.EVM_COIN_ADDRESS &&
    toToken.toLowerCase() === constants.ADDRESSES.EVM_COIN_ADDRESS
  ) {
    throw new Error('Swap between two native coins')
  }

  if (fromToken.toLowerCase() === constants.ADDRESSES.EVM_COIN_ADDRESS) {
    return useFeeOnTransfer
      ? SwapMethods.swapExactETHForTokensSupportingFeeOnTransferTokens
      : SwapMethods.swapExactETHForTokens
  } else if (toToken.toLowerCase() === constants.ADDRESSES.EVM_COIN_ADDRESS) {
    return useFeeOnTransfer
      ? SwapMethods.swapExactTokensForETHSupportingFeeOnTransferTokens
      : SwapMethods.swapExactTokensForETH
  } else {
    return useFeeOnTransfer
      ? SwapMethods.swapExactTokensForTokensSupportingFeeOnTransferTokens
      : SwapMethods.swapExactTokensForTokens
  }
}


const swapCallbackV3 = async (params) => {
  
  const {
    baseCurrency,
    chainId,
    owner,
    fromToken,
    fromTokenDecimals,
    toToken,
    toTokenDecimals,
    deadlinePeriod,
    slippage,
    sellAmount,
    buyAmount,
    waitReceipt = false,
    isNative = false,
    fromNative = false,
    toNative = false,
  } = params


  try {
    const routerAddress = config?.UNISWAP_V3_CONTRACTS[chainId]?.router
    const provider = actions[baseCurrency.toLowerCase()].getWeb3()
    
    const routerContract = getContract({
      name: 'router_v3',
      address: routerAddress,
      baseCurrency,
    })

    const tokenIn = wrapCurrency(chainId, fromToken)
    const tokenOut = wrapCurrency(chainId, toToken)
    const fee = 10000
    const recipient = owner
    const deadline = await getDeadline(provider, deadlinePeriod)
    
    const weiSellAmount = utils.amount.formatWithDecimals(sellAmount, fromTokenDecimals)
    const weiBuyAmount = utils.amount.formatWithDecimals(buyAmount, toTokenDecimals)
    const buySlilppageRange = getSlippageRange(slippage, weiBuyAmount)

    // the minimum amount of the purchased asset to be received
    const intOutMin = getMinAmount(weiBuyAmount, buySlilppageRange)
    const amountOutMinimum = utils.amount.toHexNumber(intOutMin)
    const amountIn = weiSellAmount
    
    const sqrtPriceLimitX96 = 0
    
    const callParams = [
      tokenIn,
      tokenOut,
      fee,
      recipient,
      deadline,
      amountIn,
      amountOutMinimum,
      sqrtPriceLimitX96,
    ]

    if (isNative) {
      // Свап с использованием нативных коинов
      if (fromNative) {
        // Swap Native to ERC20-like
        const txData = routerContract.methods.exactInputSingle(callParams).encodeABI()

        const sendParams = {
          to: routerAddress,
          data: txData,
          waitReceipt,
          amount: (fromNative) ? sellAmount : 0,
        }
        return actions[baseCurrency.toLowerCase()].send(sendParams)
      } else {
         // ERC20-like to Native - use multicall
         /*
          Меняем токен на врап-токен - получатель это роутер
          делаем инврап нативного токена
         */
         const callParams = [
          tokenIn,
          tokenOut,
          fee,
          routerAddress, // Шаг №1 - Токен меняем на врап - получатель это роутер
          deadline,
          amountIn,
          amountOutMinimum,
          sqrtPriceLimitX96,
        ]

        const routerAbiInterface = new AbiInterface(SwapRouterV3ABI)
        const callsData = [
          // swap to wrapped
          routerAbiInterface.encodeFunctionData('exactInputSingle', [callParams]),
          // unwrap to native
          routerAbiInterface.encodeFunctionData('unwrapWETH9', [amountOutMinimum, recipient])
        ]
        const txData = routerContract.methods.multicall(callsData).encodeABI()
        const sendParams = {
          to: routerAddress,
          data: txData,
          waitReceipt,
          amount: 0,
        }
        return actions[baseCurrency.toLowerCase()].send(sendParams)
      }
    } else {
      
      const txData = routerContract.methods.exactInputSingle(callParams).encodeABI()

      return actions[baseCurrency.toLowerCase()].send({
        to: routerAddress,
        data: txData,
        waitReceipt,
        amount: 0,
      })
    }
  } catch (error) {
    return error
  }
}

const swapCallback = async (params) => {
  const {
    routerAddress,
    baseCurrency,
    owner,
    fromToken,
    fromTokenDecimals,
    toToken,
    toTokenDecimals,
    deadlinePeriod,
    slippage,
    sellAmount,
    buyAmount,
    waitReceipt = false,
    useFeeOnTransfer,
  } = params

  try {
    const provider = actions[baseCurrency.toLowerCase()].getWeb3()
    const router = getContract({ name: 'router', address: routerAddress, baseCurrency })
    const method = returnSwapMethod({ fromToken, toToken, useFeeOnTransfer })
    const swapData = await returnSwapDataByMethod({
      chainId: actions[baseCurrency.toLowerCase()].chainId,
      slippage,
      provider,
      method,
      fromToken,
      fromTokenDecimals,
      toToken,
      toTokenDecimals,
      owner,
      deadlinePeriod,
      sellAmount,
      buyAmount,
    })

    const txData = router.methods[method](...swapData.args).encodeABI()
    
    const sendParams = {
      to: routerAddress,
      data: txData,
      waitReceipt,
      amount: swapData.value ?? 0,
    }
    return actions[baseCurrency.toLowerCase()].send(sendParams)
  } catch (error) {
    return error
  }
}

const returnAddLiquidityData = async (params) => {
  const {
    provider,
    slippage,
    tokenA,
    tokenADecimals,
    amountADesired,
    tokenB,
    tokenBDecimals,
    amountBDesired,
    owner,
    deadlinePeriod,
  } = params
  const lowerTokenA = tokenA.toLowerCase()
  const lowerTokenB = tokenB.toLowerCase()
  let method: string
  let args: (string | number)[]
  let value: number = 0

  if (
    lowerTokenA === constants.ADDRESSES.EVM_COIN_ADDRESS &&
    lowerTokenB === constants.ADDRESSES.EVM_COIN_ADDRESS
  ) {
    throw new Error('Two native coins')
  }

  const { formatWithDecimals, toHexNumber } = utils.amount
  const deadline = await getDeadline(provider, deadlinePeriod)
  const unitAmountADesired = formatWithDecimals(amountADesired, tokenADecimals)
  const unitAmountBDesired = formatWithDecimals(amountBDesired, tokenBDecimals)

  const amountASlippageRange = getSlippageRange(
    slippage,
    formatWithDecimals(amountADesired, tokenADecimals)
  )
  const amountBSlippageRange = getSlippageRange(
    slippage,
    formatWithDecimals(amountBDesired, tokenBDecimals)
  )

  const amountAMin = getMinAmount(unitAmountADesired, amountASlippageRange)
  const amountBMin = getMinAmount(unitAmountBDesired, amountBSlippageRange)
  const hexAmountADesired = toHexNumber(unitAmountADesired)
  const hexAmountBDesired = toHexNumber(unitAmountBDesired)
  const hexAmountAMin = toHexNumber(amountAMin)
  const hexAmountBMin = toHexNumber(amountBMin)

  if (
    lowerTokenA === constants.ADDRESSES.EVM_COIN_ADDRESS ||
    lowerTokenB === constants.ADDRESSES.EVM_COIN_ADDRESS
  ) {
    const tokenAIsNative = lowerTokenA === constants.ADDRESSES.EVM_COIN_ADDRESS

    method = LiquidityMethods.addLiquidityETH
    value = tokenAIsNative ? amountADesired : amountBDesired
    args = [
      tokenAIsNative ? tokenB : tokenA,
      tokenAIsNative ? hexAmountBDesired : hexAmountADesired,
      tokenAIsNative ? hexAmountBMin : hexAmountAMin,
      tokenAIsNative ? hexAmountAMin : hexAmountBMin,
      owner,
      deadline,
    ]
  } else {
    method = LiquidityMethods.addLiquidity
    args = [
      tokenA,
      tokenB,
      hexAmountADesired,
      hexAmountBDesired,
      hexAmountBMin,
      hexAmountBMin,
      owner,
      deadline,
    ]
  }

  return {
    method,
    args,
    value,
  }
}

const addLiquidityCallback = async (params) => {
  const {
    routerAddress,
    baseCurrency,
    waitReceipt = false,
    tokenA,
    tokenADecimals,
    amountADesired,
    tokenB,
    tokenBDecimals,
    amountBDesired,
    owner,
    deadlinePeriod,
  } = params
  let { slippage } = params

  const provider = actions[baseCurrency.toLowerCase()].getWeb3()
  const { method, args, value } = await returnAddLiquidityData({
    provider,
    tokenA,
    tokenADecimals,
    amountADesired,
    slippage,
    tokenB,
    tokenBDecimals,
    amountBDesired,
    owner,
    deadlinePeriod,
  })
  const router = getContract({ name: 'router', address: routerAddress, baseCurrency })
  const txData = router.methods[method](...args).encodeABI()

  try {
    const hexValue = new BigNumber(value).multipliedBy(10 ** 18).toString(16)
    const gasLimit = await router.methods[method](...args).estimateGas({
      from: owner,
      value: `0x${hexValue}`,
    })
    const additionGasMultiplier = 1.1

    return actions[baseCurrency.toLowerCase()].send({
      to: routerAddress,
      data: txData,
      waitReceipt,
      amount: value,
      gasLimit: new BigNumber(gasLimit).multipliedBy(additionGasMultiplier).toFixed(0) || 0,
    })
  } catch (error) {
    console.group('%c add liquidity', 'color: red')
    console.error(error)
    console.groupEnd()
    return false
  }
}

export default {
  getContract,
  getPairAddress,
  getAmountOut,
  getLiquidityAmountForAssetB,
  swapCallback,
  addLiquidityCallback,
  
  // v3
  calcPriceV3,
  getPoolAddressV3,
  getAmountOutV3,
  swapCallbackV3,
}
