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
import { abi as PositionManagerV3ABI } from '@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'
import { abi as PoolV3ABI } from '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json'
import { abi as ERC20MetadataABI } from '@uniswap/v3-periphery/artifacts/contracts/interfaces/IERC20Metadata.sol/IERC20Metadata.json'
import { abi as MulticallABI } from 'common/multicall/abi.json'
import { Interface as AbiInterface } from '@ethersproject/abi'
import JSBI from 'jsbi'

const ABIS = {
  factory: FactoryV2ABI,
  router: RouterV2ABI,
  pair: PairV2ABI,
  
  factory_v3: FactoryV3ABI,
  pool_v3: PoolV3ABI,
  quoter_v3: QuoterV3ABI,
  router_v3: SwapRouterV3ABI,
  position_manager_v3: PositionManagerV3ABI,
  
  erc20: ERC20MetadataABI,
  multicall: MulticallABI,
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
  name: 'factory' | 'router' | 'pair' | 'factory_v3' | 'quoter_v3' | 'router_v3' | 'position_manager_v3' | 'pool_v3' | 'erc20' | 'multicall'
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
// Get pools for all exists fee
// { fee => address, ... }
const getPoolAddressV3All = async (params) => {
  const { baseCurrency, chainId } = params
  let { tokenA, tokenB, fee } = params

  tokenA = wrapCurrency(chainId, tokenA)
  tokenB = wrapCurrency(chainId, tokenB)
  
  const mcContract = getContract({
    name: 'multicall',
    address: config?.UNISWAP_V3_CONTRACTS[chainId]?.multicall,
    baseCurrency,
  })
  const factoryAddress = config?.UNISWAP_V3_CONTRACTS[chainId]?.factory
  const factoryInterface = new AbiInterface(FactoryV3ABI)
  
  const allowedFees = [
    100,  // 0.01%
    500,  // 0.05%
    3000, // 0.3%
    10000,// 1%
  ]
  const poolsByFeeCalls = allowedFees.map((fee) => {
    return {
      target: factoryAddress,
      callData: factoryInterface.encodeFunctionData('getPool', [tokenA, tokenB, fee])
    }
  })
  
  const poolsByFeeAnswers = await mcContract?.methods.tryAggregate(false, poolsByFeeCalls).call()

  const poolsByFee = allowedFees.map((fee, feeIndex) => {
    return {
      fee,
      address: factoryInterface.decodeFunctionResult('getPool', poolsByFeeAnswers[feeIndex].returnData)[0],
    }
  }).filter(({ address }) => {
    return address != "0x0000000000000000000000000000000000000000"
  })
  console.log('>>> poolsByFeeAnswers',poolsByFee, poolsByFeeAnswers)
  return poolsByFee
}
window.getPoolAddressV3All = getPoolAddressV3All

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
    console.log('>>>> V3 PoolAddress ', params, poolAddress)
    return poolAddress
  } catch (error) {
    console.error(error)
    return false
  }
}
window.getPoolAddressV3 = getPoolAddressV3

const getPoolInfoV3 = async (params) => {
  const {
    baseCurrency,
    chainId,
    poolAddress,
  } = params
  
  const mcContract = getContract({
    name: 'multicall',
    address: config?.UNISWAP_V3_CONTRACTS[chainId]?.multicall,
    baseCurrency,
  })

  // Fetch base pool info
  const poolInterface = new AbiInterface(PoolV3ABI)
  const basePoolInfoCalls = [
    { target: poolAddress, callData: poolInterface.encodeFunctionData('slot0') },
    { target: poolAddress, callData: poolInterface.encodeFunctionData('token0') },
    { target: poolAddress, callData: poolInterface.encodeFunctionData('token1') },
  ]

  const basePoolInfoAnswer = await mcContract?.methods.tryAggregate(false, basePoolInfoCalls).call()

  const pool_slot0 = poolInterface.decodeFunctionResult('slot0', basePoolInfoAnswer[0].returnData)
  const pool_token0 = poolInterface.decodeFunctionResult('token0', basePoolInfoAnswer[1].returnData)[0]
  const pool_token1 = poolInterface.decodeFunctionResult('token1', basePoolInfoAnswer[2].returnData)[0]
  
  console.log('>>>', pool_slot0, pool_token0, pool_token1)
  // Fetch tokens info
  const tokenInterface = new AbiInterface(ERC20MetadataABI)
  const tokensInfoCalls = [
    { target: pool_token0, callData: tokenInterface.encodeFunctionData('decimals') },
    { target: pool_token0, callData: tokenInterface.encodeFunctionData('symbol') },
    { target: pool_token1, callData: tokenInterface.encodeFunctionData('decimals') },
    { target: pool_token1, callData: tokenInterface.encodeFunctionData('symbol') }
  ]
  const tokensInfoAnswer = await mcContract?.methods.tryAggregate(false, tokensInfoCalls).call()

  const poolInfo = {
    ...pool_slot0,
    sqrtPriceX96: pool_slot0.sqrtPriceX96.toString(),
    token0: {
      address: pool_token0,
      decimals: tokenInterface.decodeFunctionResult('decimals', tokensInfoAnswer[0].returnData)[0],
      symbol: tokenInterface.decodeFunctionResult('symbol', tokensInfoAnswer[1].returnData)[0],
    },
    token1: {
      address: pool_token1,
      decimals: tokenInterface.decodeFunctionResult('decimals', tokensInfoAnswer[2].returnData)[0],
      symbol: tokenInterface.decodeFunctionResult('symbol', tokensInfoAnswer[3].returnData)[0],
    }
  }
  
  return poolInfo
}

window.getPoolInfoV3 = getPoolInfoV3

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
    fee || 100,//00,
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

  const buyOneOfToken0 = (new BigNumber(sqrtPriceX96).dividedBy(new BigNumber(2).pow(96))).pow(2).dividedBy(
    new BigNumber(10).pow(Decimal1).dividedBy(new BigNumber(10).pow(Decimal0))
  ).toFixed(Decimal1)
  const buyOneOfToken1 = new BigNumber(1).dividedBy(buyOneOfToken0).toFixed(Decimal0);
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
window.calcPriceV3 = calcPriceV3

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

const createPoolV3 = async (params) => {
}

const addLiquidityPositionsV3 = async (params) => {
}
/*
const getSqrtRatioAtTick = (tick) => {
  //const ret = new BigNumber(1.0001).exponentiatedBy(tick).multipliedBy( new BigNumber(2).exponentiatedBy(96) )
  //console.log(ret, ret.toString())
// sqrt(1.0001^tick) * 2^96
}
*/


const getTickAtSqrtRatio = (sqrtPriceX96) => {
  const Q96 = new BigNumber(2).exponentiatedBy(96)
  console.log(Q96, Q96.toString())
  const tQ96 = new BigNumber(sqrtPriceX96).dividedBy(Q96).toNumber()
  console.log(tQ96)
  let tick = Math.floor(Math.log(tQ96**2)/Math.log(1.0001))
  console.log('>>> getTickAtSqrtRatio', tick)
  return tick
}
window.getTickAtSqrtRatio = getTickAtSqrtRatio
const getUserPoolLiquidityV3 = async (params) => {
  const {
    owner,
    baseCurrency,
    chainId,
    poolAddress,
  } = params
  
  const poolInfo = await getPoolInfoV3({
    poolAddress,
    chainId,
    baseCurrency
  })

  console.log('>>> poolInfo', poolInfo)
  
  const poolPositionsRaw = await getUserLiquidityPositionsV3({
    owner,
    baseCurrency,
    chainId,
    fromToken: poolInfo.token0.address,
    toToken: poolInfo.token1.address,
  })
  const currentPrice = calcPriceV3({
    sqrtPriceX96: poolInfo.sqrtPriceX96,
    Decimal0: poolInfo.token0.decimals,
    Decimal1: poolInfo.token1.decimals,
  })
  const poolPositions = poolPositionsRaw.map((poolPosition) => {
    const positionLiquidity = getTokenAmountsV3({
      liquidity: poolPosition.liquidity,
      sqrtPriceX96: poolInfo.sqrtPriceX96,
      tickLow: poolPosition.tickLower,
      tickHigh: poolPosition.tickUpper,
      Decimal0: poolInfo.token0.decimals,
      Decimal1: poolInfo.token1.decimals,
    })
    const priceLow = calcPriceV3({
      sqrtPriceX96: new BigNumber(getSqrtRatioAtTick(poolPosition.tickLower).toString()).toString(), 
      Decimal0: poolInfo.token0.decimals,
      Decimal1: poolInfo.token1.decimals,
    })
    const priceHigh = calcPriceV3({
      sqrtPriceX96: new BigNumber(getSqrtRatioAtTick(poolPosition.tickUpper).toString()).toString(),
      Decimal0: poolInfo.token0.decimals,
      Decimal1: poolInfo.token1.decimals,
    })
    return {
      ...poolPosition,
      rangeType: positionLiquidity.rangeType,
      token0: {
        ...poolInfo.token0,
        amountWei: positionLiquidity.amount0wei,
        amount: positionLiquidity.amount0Human,
      },
      token1: {
        ...poolInfo.token1,
        amountWei: positionLiquidity.amount1wei,
        amount: positionLiquidity.amount1Human,
      },
      priceLow,
      priceHigh,
    }
  })
  
  console.log(poolPositions)
  return {
    pool: {
      ...poolInfo,
      currentPrice,
    },
    positions: poolPositions,
  }
}

const mulShift = (val, mulBy) => {
  return JSBI.signedRightShift(
    JSBI.multiply(val, JSBI.BigInt(mulBy)),
    JSBI.BigInt(128),
  )
}
window.BigNumber = BigNumber
window.mulShift = mulShift

//

const getSqrtRatioAtTick = (tick) => {
  const Q32 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(32))
  const ONE = JSBI.BigInt(1)
  const ZERO = JSBI.BigInt(0)
  const MaxUint256 = JSBI.BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
  
  const absTick = tick < 0 ? tick * -1 : tick;

  let ratio =
    (absTick & 0x1) !== 0
      ? JSBI.BigInt('0xfffcb933bd6fad37aa2d162d1a594001')
      : JSBI.BigInt('0x100000000000000000000000000000000');
  if ((absTick & 0x2) !== 0) {
    ratio = mulShift(ratio, '0xfff97272373d413259a46990580e213a');
  }
  if ((absTick & 0x4) !== 0) {
    ratio = mulShift(ratio, '0xfff2e50f5f656932ef12357cf3c7fdcc');
  }
  if ((absTick & 0x8) !== 0) {
    ratio = mulShift(ratio, '0xffe5caca7e10e4e61c3624eaa0941cd0');
  }
  if ((absTick & 0x10) !== 0) {
    ratio = mulShift(ratio, '0xffcb9843d60f6159c9db58835c926644');
  }
  if ((absTick & 0x20) !== 0) {
    ratio = mulShift(ratio, '0xff973b41fa98c081472e6896dfb254c0');
  }
  if ((absTick & 0x40) !== 0) {
    ratio = mulShift(ratio, '0xff2ea16466c96a3843ec78b326b52861');
  }
  if ((absTick & 0x80) !== 0) {
    ratio = mulShift(ratio, '0xfe5dee046a99a2a811c461f1969c3053');
  }
  if ((absTick & 0x100) !== 0) {
    ratio = mulShift(ratio, '0xfcbe86c7900a88aedcffc83b479aa3a4');
  }
  if ((absTick & 0x200) !== 0) {
    ratio = mulShift(ratio, '0xf987a7253ac413176f2b074cf7815e54');
  }
  if ((absTick & 0x400) !== 0) {
    ratio = mulShift(ratio, '0xf3392b0822b70005940c7a398e4b70f3');
  }
  if ((absTick & 0x800) !== 0) {
    ratio = mulShift(ratio, '0xe7159475a2c29b7443b29c7fa6e889d9');
  }
  if ((absTick & 0x1000) !== 0) {
    ratio = mulShift(ratio, '0xd097f3bdfd2022b8845ad8f792aa5825');
  }
  if ((absTick & 0x2000) !== 0) {
    ratio = mulShift(ratio, '0xa9f746462d870fdf8a65dc1f90e061e5');
  }
  if ((absTick & 0x4000) !== 0) {
    ratio = mulShift(ratio, '0x70d869a156d2a1b890bb3df62baf32f7');
  }
  if ((absTick & 0x8000) !== 0) {
    ratio = mulShift(ratio, '0x31be135f97d08fd981231505542fcfa6');
  }
  if ((absTick & 0x10000) !== 0) {
    ratio = mulShift(ratio, '0x9aa508b5b7a84e1c677de54f3e99bc9');
  }
  if ((absTick & 0x20000) !== 0) {
    ratio = mulShift(ratio, '0x5d6af8dedb81196699c329225ee604');
  }
  if ((absTick & 0x40000) !== 0) {
    ratio = mulShift(ratio, '0x2216e584f5fa1ea926041bedfe98');
  }
  if ((absTick & 0x80000) !== 0) {
    ratio = mulShift(ratio, '0x48a170391f7dc42444e8fa2');
  }

  if (tick > 0) {
    ratio = JSBI.divide(MaxUint256, ratio);
  }

  // back to Q96
  const result = JSBI.greaterThan(JSBI.remainder(ratio, Q32), ZERO)
    ? JSBI.add(JSBI.divide(ratio, Q32), ONE)
    : JSBI.divide(ratio, Q32);

  return result;
}
window.getSqrtRatioAtTick = getSqrtRatioAtTick
        
const getTokenAmountsV3 = (params) => {
  const { liquidity,sqrtPriceX96,tickLow,tickHigh,Decimal0,Decimal1 } = params
console.log('>>> getTokenAmountsV3', params)
  let sqrtRatioA = Math.sqrt(1.0001**tickLow);
  let sqrtRatioB = Math.sqrt(1.0001**tickHigh);

  let currentTick = getTickAtSqrtRatio(sqrtPriceX96)
  let sqrtPrice = new BigNumber(sqrtPriceX96).dividedBy(new BigNumber(2).exponentiatedBy(96))

  let amount0wei = 0;
  let amount1wei = 0;
  
  let rangeType = 0
console.log('>>> sqrtRatio', sqrtRatioA, sqrtRatioB)
  if(currentTick <= tickLow){
    // amount0wei = Math.floor(liquidity*((sqrtRatioB-sqrtRatioA)/(sqrtRatioA*sqrtRatioB)));
    rangeType = 0
    amount0wei = Math.floor(
      new BigNumber(liquidity).multipliedBy(
        (
          new BigNumber(sqrtRatioB).minus(sqrtRatioA)
        ).dividedBy(
          new BigNumber(sqrtRatioA).multipliedBy(sqrtRatioB)
        )
      ).toNumber()
    )
  } else if(currentTick > tickHigh){
    // amount1wei = Math.floor(liquidity*(sqrtRatioB-sqrtRatioA));
    rangeType = 1
    amount1wei = Math.floor(
      new BigNumber(liquidity).multipliedBy(
        new BigNumber(sqrtRatioB).minus(sqrtRatioA)
      ).toNumber()
    )
  } else if(currentTick >= tickLow && currentTick < tickHigh){ 
    // amount0wei = Math.floor(liquidity*((sqrtRatioB-sqrtPrice)/(sqrtPrice*sqrtRatioB)));
    // amount1wei = Math.floor(liquidity*(sqrtPrice-sqrtRatioA));
    rangeType = 2
    amount0wei = Math.floor(
      new BigNumber(liquidity).multipliedBy(
        (
          new BigNumber(sqrtRatioB).minus(sqrtPrice)
        ).dividedBy(
          new BigNumber(sqrtPrice).multipliedBy(sqrtRatioB)
        )
      ).toNumber()
    )
    amount1wei = Math.floor(
      new BigNumber(liquidity).multipliedBy(
        new BigNumber(sqrtPrice).minus(sqrtRatioA)
      ).toNumber()
    )
  }
  const amount0Human = (Math.abs(amount0wei/(10**Decimal0))).toFixed(Decimal0)
  const amount1Human = (Math.abs(amount1wei/(10**Decimal1))).toFixed(Decimal1);
  return {
    amount0wei,
    amount1wei,
    amount0Human,
    amount1Human,
    rangeType,
    sqrtRatioA,
    sqrtRatioB,
  }
}
window.getTokenAmountsV3 = getTokenAmountsV3

window.getUserPoolLiquidityV3 = getUserPoolLiquidityV3

// fromToken 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270
// toToken 0xD10b8A62764852C754f66ebA75556F63938E9026
const getUserLiquidityPositionsV3 = async (params) => {
  const {
    owner,
    baseCurrency,
    chainId,
    fromToken,
    toToken,
  } = params

  console.log('>> getUserLiquidityPositionsV3', params)
  const positionsContractAddress = config?.UNISWAP_V3_CONTRACTS[chainId]?.position_manager
  const positionsContract = getContract({
    name: 'position_manager_v3',
    address: positionsContractAddress,
    baseCurrency,
  })

  const positionsInterface = new AbiInterface(PositionManagerV3ABI)

  // get count of user positions
  const positionsCount = await positionsContract.methods.balanceOf(owner).call()

  // get user positions ids
  const tokenIdsCallArgs = (Array.apply(null, Array(Number(positionsCount)))).map((_, index) => {
    return positionsInterface.encodeFunctionData('tokenOfOwnerByIndex', [owner, index])
  })

  const tokenIdsAnswer = await positionsContract.methods.multicall(tokenIdsCallArgs).call()

  const userPositionsIds = tokenIdsAnswer.map((answer) => {
    return positionsInterface.decodeFunctionResult('tokenOfOwnerByIndex', answer).toString()
  })
  // fetch positions detail information
  const positionsInfoCallArgs = userPositionsIds.map((positionId) => {
    return positionsInterface.encodeFunctionData('positions', [positionId])
  })
  const positionsInfoAnswer = await positionsContract.methods.multicall(positionsInfoCallArgs).call()

  const positionsInfo = positionsInfoAnswer.map((answer, i) => {
    const result = positionsInterface.decodeFunctionResult('positions', answer)
    return {
      tokenId: userPositionsIds[i],
      fee: result.fee,
      feeGrowthInside0LastX128: result.feeGrowthInside0LastX128.toString(),
      feeGrowthInside1LastX128: result.feeGrowthInside1LastX128.toString(),
      liquidity: result.liquidity.toString(),
      nonce: result.nonce.toString(),
      operator: result.operator,
      tickLower: result.tickLower,
      tickUpper: result.tickUpper,
      token0: result.token0,
      token1: result.token1,
      tokensOwed0: result.tokensOwed0.toString(),
      tokensOwed1: result.tokensOwed1.toString(),
    }
  })
  if (fromToken && toToken) {
    return positionsInfo.filter((positionInfo) => {
      return (
        ((fromToken.toLowerCase() == positionInfo.token0.toLowerCase()) && (toToken.toLowerCase() == positionInfo.token1.toLowerCase()))
        ||
        ((fromToken.toLowerCase() == positionInfo.token1.toLowerCase()) && (toToken.toLowerCase() == positionInfo.token0.toLowerCase()))
      )
    })
  } else return positionsInfo
}

window.getUserLiquidityPositionsV3 = getUserLiquidityPositionsV3

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
    fee = 10000,
  } = params

console.log('>>>> DO swapCallbackV3 ->>>> FEE', fee)
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
  getPoolAddressV3All,
  getAmountOutV3,
  swapCallbackV3,
  getUserPoolLiquidityV3,
  
  
  wrapCurrency,
}
