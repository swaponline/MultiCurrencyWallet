import { BigNumber } from 'bignumber.js'
import { EVM_COIN_ADDRESS } from 'common/helpers/constants/ADDRESSES'
import utils from 'common/utils'
import actions from 'redux/actions'
import { externalConfig } from 'helpers'
import { COIN_DECIMALS, MAX_PERCENT, GWEI_DECIMALS } from './constants'
import { ServiceFee, SwapData } from './types'

export const buildApiSwapParams = (params: {
  route: '/price' | '/quote'
  skipValidation?: boolean
  slippage: number
  spendedAmount: string
  fromWallet: IUniversalObj
  toWallet: IUniversalObj
  serviceFee: ServiceFee | false
  zeroxApiKey: string
}): {
  headers: { '0x-api-key': string }
  endpoint: string
} => {
  const {
    route,
    skipValidation = false,
    slippage,
    spendedAmount,
    fromWallet,
    toWallet,
    serviceFee,
    zeroxApiKey,
  } = params

  const sellToken = fromWallet?.contractAddress || EVM_COIN_ADDRESS
  const buyToken = toWallet?.contractAddress || EVM_COIN_ADDRESS

  const sellAmount = utils.amount.formatWithDecimals(
    spendedAmount,
    fromWallet.decimals || COIN_DECIMALS
  )

  const enoughBalanceForSwap = new BigNumber(fromWallet.balance).isGreaterThan(
    new BigNumber(spendedAmount)
  )

  const request = [
    `/swap/v1${route}?`,
    `buyToken=${buyToken}&`,
    `sellToken=${sellToken}&`,
    `sellAmount=${sellAmount}`,
  ]
  if (enoughBalanceForSwap) {
    request.push(`&takerAddress=${fromWallet.address}`)
  }

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

  return {
    headers: { '0x-api-key': zeroxApiKey },
    endpoint: request.join(''),
  }
}

export const estimateApiSwapData = async (params: {
  data: SwapData
  withoutValidation?: RegExpMatchArray | null
  baseChainWallet: IUniversalObj
  toWallet: IUniversalObj
  gasLimit: string
  gasPrice: string
  onError?: (e: Error) => void
}): Promise<{
  receivedAmount: string
  swapData: SwapData
  swapFee: string
  isPending: boolean
}> => {
  const {
    data,
    withoutValidation = null,
    baseChainWallet,
    toWallet,
    gasLimit,
    gasPrice,
    onError,
  } = params

  // We've had a special error in the previous request. It means there is
  // some problem and we add a "skip validation" parameter to bypass it.
  // Usually the swap tx with this parameter fails in the blockchain,
  // because it's not enough gas limit. Estimate manually
  if (withoutValidation) {
    const estimatedGas: string | Error = await actions[
      baseChainWallet.currency.toLowerCase()
    ]?.estimateGas(data)

    if (estimatedGas instanceof Error) {
      onError && onError(estimatedGas)
    } else {
      data.gas = estimatedGas
    }
  }

  const customGasLimit = gasLimit && gasLimit > data.gas ? gasLimit : data.gas
  const customGasPrice = gasPrice
    ? utils.amount.formatWithDecimals(gasPrice, GWEI_DECIMALS)
    : data.gasPrice

  const weiFee = new BigNumber(customGasLimit).times(customGasPrice)
  const swapFee = utils.amount.formatWithoutDecimals(weiFee, COIN_DECIMALS)
  const receivedAmount = utils.amount.formatWithoutDecimals(
    data.buyAmount,
    toWallet?.decimals || COIN_DECIMALS
  )

  return {
    receivedAmount,
    swapData: data,
    swapFee,
    isPending: false,
  }
}
