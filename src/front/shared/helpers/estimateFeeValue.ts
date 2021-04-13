import COINS_WITH_DYNAMIC_FEE from 'common/helpers/constants/COINS_WITH_DYNAMIC_FEE'
import helpers from 'helpers'


const setEstimatedFeeValues = async ({ estimatedFeeValues }) => {

  let newEstimatedFeeValues = { ...estimatedFeeValues }

  for await (let item of COINS_WITH_DYNAMIC_FEE) {
    try {
      const newValue = await helpers[item].estimateFeeValue({ method: 'swap', speed: 'fast' })
      if (newValue) {
        newEstimatedFeeValues[item] = newValue
      }
    } catch (error) {
      console.warn('Set Estimated Fee Values in for error: ', error)
    }
  }

  return newEstimatedFeeValues
}


export default {
  setEstimatedFeeValues,
}
