import bitcoin from 'bitcoinjs-lib'
import { getState } from 'redux/core'
import actions from 'redux/actions'


const network = process.env.MAINNET ? bitcoin.networks.bitcoin : bitcoin.networks.testnet

const estimateFeeValue = async ({ satoshi, speed } = {}) => {
  const feeRate = await estimateFeeRate({ speed })

  if (satoshi) {
    return Math.ceil(feeRate * 226 / 1024)
  }

  return Math.ceil(feeRate * 226 / 1024) * 1e-8
}

const estimateFeeRate = async ({ speed } = { speed: 'normal' }) => {
  await actions.btc.setFeeRate()

  const { user: { btcData: { feeRate } } } = getState()

  return feeRate[speed]
}

export default {
  estimateFeeValue,
  estimateFeeRate,
  network,
}
