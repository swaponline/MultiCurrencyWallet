import BigNumber from 'bignumber.js'
import { abi as RouterV2ABI } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import constants from 'common/helpers/constants'
import utils from 'common/utils'
import externalConfig from 'helpers/externalConfig'
import actions from 'redux/actions'

enum SwapMethods {
  swapExactETHForTokens = 'swapExactETHForTokens',
  swapExactTokensForETH = 'swapExactTokensForETH',
  swapExactTokensForTokens = 'swapExactTokensForTokens',
  swapTokensForExactTokens = 'swapTokensForExactTokens',
  swapExactETHForTokensSupportingFeeOnTransferTokens = 'swapExactETHForTokensSupportingFeeOnTransferTokens',
  swapExactTokensForETHSupportingFeeOnTransferTokens = 'swapExactTokensForETHSupportingFeeOnTransferTokens',
  swapExactTokensForTokensSupportingFeeOnTransferTokens = 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
}

const getContract = (params) => {
  const { address, abi, provider } = params

  return new provider.eth.Contract(abi, address)
}

const getRouterContract = (params: { routerAddress: string; provider: EthereumProvider }) => {
  const { routerAddress, provider } = params

  return getContract({ address: routerAddress, abi: RouterV2ABI, provider })
}

const returnSwapDataByMethod = async (
  params
): Promise<{
  args: any[]
  value?: string
}> => {
  const {
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

  const latestBlockNumber = await provider.eth.getBlockNumber()
  const latestBlock = await provider.eth.getBlock(latestBlockNumber)
  const timestamp = latestBlock.timestamp

  const path = [fromToken, toToken]
  // after this time, the transaction will be canceled
  const deadline = `0x${new BigNumber(timestamp).plus(deadlinePeriod).toString(16)}`

  const weiSellAmount = utils.amount.formatWithDecimals(sellAmount, fromTokenDecimals)
  const weiBuyAmount = utils.amount.formatWithDecimals(buyAmount, toTokenDecimals)

  const availableSlippageRange = new BigNumber(weiBuyAmount).div(100).times(slippage)
  // the minimum amount of the purchased asset to be received
  const amountOutMin = `0x${new BigNumber(weiBuyAmount).minus(availableSlippageRange).toString(16)}`
  const amountIn = `0x${new BigNumber(weiSellAmount).toString(16)}`

  switch (method) {
    // case SwapMethods.swapExactETHForTokensSupportingFeeOnTransferTokens:
    case SwapMethods.swapExactETHForTokens:
      return {
        args: [amountOutMin, path, owner, deadline],
        value: amountIn,
      }

    // case SwapMethods.swapExactTokensForTokensSupportingFeeOnTransferTokens:
    // case SwapMethods.swapExactTokensForETHSupportingFeeOnTransferTokens:
    case SwapMethods.swapExactTokensForETH:
    case SwapMethods.swapExactTokensForTokens:
      return {
        args: [amountIn, amountOutMin, path, owner, deadline],
      }
  }

  return { args: [] }
}

const returnSwapMethod = (params) => {
  const { fromToken, toToken } = params

  if (
    fromToken.toLowerCase() === constants.EVM_COIN_ADDRESS &&
    toToken.toLowerCase() === constants.EVM_COIN_ADDRESS
  ) {
    throw new Error('Swap between two native coins')
  }

  if (fromToken.toLowerCase() === constants.EVM_COIN_ADDRESS) {
    return SwapMethods.swapExactETHForTokens
    // return SwapMethods.swapExactETHForTokensSupportingFeeOnTransferTokens
  } else if (toToken.toLowerCase() === constants.EVM_COIN_ADDRESS) {
    return SwapMethods.swapExactTokensForETH
    // return SwapMethods.swapExactTokensForETHSupportingFeeOnTransferTokens
  } else {
    return SwapMethods.swapExactTokensForTokens
    // return SwapMethods.swapExactTokensForTokensSupportingFeeOnTransferTokens
  }
}

const checkAndApproveToken = async (params) => {
  const { standard, token, owner, decimals, spender, sellAmount, tokenName } = params

  const allowance = await actions.oneinch.fetchTokenAllowance({
    contract: token,
    standard,
    owner,
    decimals,
    spender,
  })

  return new Promise(async (res, rej) => {
    if (new BigNumber(sellAmount).isGreaterThan(allowance)) {
      const result = await actions[standard].approve({
        name: tokenName,
        to: spender,
        amount: new BigNumber(sellAmount).multipliedBy(1000).toNumber(),
      })

      return typeof result === 'string' ? res(result) : rej(result)
    }

    res(true)
  })
}

const swapCallback = async (params) => {
  const {
    routerAddress,
    baseCurrency,
    ownerAddress,
    fromToken,
    fromTokenDecimals,
    toToken,
    toTokenDecimals,
    deadlinePeriod,
    slippage,
    sellAmount,
    buyAmount,
    fromTokenStandard,
    fromTokenName,
  } = params

  if (!deadlinePeriod) {
    throw new Error('No deadline period')
  }

  const provider = actions[baseCurrency.toLowerCase()].getWeb3()
  const router = getRouterContract({ routerAddress, provider })
  const method = returnSwapMethod({ fromToken, toToken })
  const swapData = await returnSwapDataByMethod({
    slippage,
    provider,
    method,
    fromToken,
    fromTokenDecimals,
    toToken,
    toTokenDecimals,
    owner: ownerAddress,
    deadlinePeriod,
    sellAmount,
    buyAmount,
  })

  if (!router) {
    throw new Error('No router contract found')
  } else if (router[method]) {
    throw new Error('No such method in the router contract')
  } else if (!swapData.args.length) {
    throw new Error('No arguments')
  }

  console.log('%c swap callback', 'color:orange;font-size:20px')
  console.log('params: ', params)
  console.log('method: ', method)
  console.log('swapData: ', swapData)
  console.log('router: ', router)

  try {
    if (fromTokenStandard && fromToken.toLowerCase() !== constants.EVM_COIN_ADDRESS) {
      const result = await checkAndApproveToken({
        tokenName: fromTokenName,
        sellAmount,
        standard: fromTokenStandard,
        token: fromToken,
        owner: ownerAddress,
        decimals: fromTokenDecimals,
        spender: routerAddress,
      })

      if (!result) return result
    }

    // const options = swapData.value
    //   ? { value: swapData.value, from: ownerAddress }
    //   : { from: ownerAddress }

    const txData: string[] = []

    // as an argument pass the string with method name and his argument types
    // without spaces!
    // ex: swapExactTokensForTokens(uint256,uint256,address[],address,uint256)
    // hex method = provider.utils.keccak256(^)

    txData.push('38ed1739')
    const arrArgs: string[] = []

    swapData.args.forEach((arg) => {
      let tempArg = arg
      const MIN_ARG_LENGHT = 64 // hex chars


      if (typeof tempArg === 'string') {
        if (tempArg.match(/^0x/)) {
          tempArg = tempArg.replace(/0x/, '')
        }

        if (tempArg.length < MIN_ARG_LENGHT) {
          tempArg = tempArg.padStart(MIN_ARG_LENGHT, '0')
        }

        txData.push(tempArg)
      } else if (Array.isArray(tempArg)) {
        txData.push('00000000000000000000000000000000000000000000000000000000000000a0')

        let arrLength = tempArg.length.toString(16)

        if (arrLength.length < MIN_ARG_LENGHT) {
          arrLength = arrLength.padStart(MIN_ARG_LENGHT, '0')
        }

        arrArgs.push(arrLength)

        tempArg.forEach((arg) => {
          if (arg.match(/^0x/)) {
            arg = arg.replace(/0x/, '')
          }

          if (arg.length < MIN_ARG_LENGHT) {
            arrArgs.push( arg.padStart(MIN_ARG_LENGHT, '0') )
          }
        })
      }
    })

    if (arrArgs.length) {
      arrArgs.forEach((arg) => {
        txData.push(arg)
      })
    }

    console.log('tx data: ', txData)
    console.log('tx data join: ', txData.join(''))

    return actions.bnb.send({
      to: routerAddress,
      data: txData.join(''),
      waitReceipt: true,
    })

    return new Promise(async (res, rej) => {
      router.methods[method](...swapData.args)
        .call()
        .then((response) => {
          console.group('%c Router', 'color: green;')
          console.log('response: ', response)
          console.groupEnd()

          res(response.hash)
        })
        .catch((error) => {
          const REJECT_CODE = 4001

          if (error?.code === REJECT_CODE) {
            res(false)
            return console.log('Rejected')
          }

          console.group('%c Router', 'color: red;')
          console.error('error: ', error)
          console.groupEnd()

          rej(error)
        })
    })
  } catch (error) {
    console.log('error outside the router code')
    console.log('error: ', error)
  }
}

export default {
  getContract,
  getRouterContract,
  swapCallback,
}
