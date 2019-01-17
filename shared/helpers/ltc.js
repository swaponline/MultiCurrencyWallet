import coininfo from 'coininfo'
import { getState } from 'redux/core'
import actions from 'redux/actions'


const networkCoininfo = process.env.MAINNET ? coininfo.litecoin.main : coininfo.litecoin.test
const network = networkCoininfo.toBitcoinJS()

const estimateFeeValue = async ({ satoshi, speed } = {}) => {
  const feeRate = await estimateFeeRate({ speed })

  if (satoshi) {
    return Math.ceil(feeRate * 226 / 1024)
  }

  return Math.ceil(feeRate * 226 / 1024) * 1e-8
}

const estimateFeeRate = async ({ speed } = { speed: 'normal' }) => {
  await actions.ltc.setFeeRate()

  const { user: { ltcData: { feeRate } } } = getState()

  return feeRate[speed]
}

export default {
  estimateFeeValue,
  estimateFeeRate,
  network,
}
