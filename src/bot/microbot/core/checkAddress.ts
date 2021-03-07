import BigNumber from 'bignumber.js'
import request from 'request-promise-cache'
import _debug from 'debug'

import {
  TRADE_CONFIG,
  TRADE_LIMITS
} from '../../config/constants'


const CHECK_SWAP_API = 'https://noxon.io/swapantisliv/checkSwapSellerAddress.php'

const debug = _debug('swap.bot')

/**
 *
 * @param {object} options
 * @param {string} options.participantAddress
 * @param {string} options.buyCurrency
 * @param {string} options.buyAmount
 * @param {string} options.sellAmount
 * @returns {Promise.<boolean>}
 */
export const checkParticipantAddress = (options) => {
  const { buyCurrency } = options

  switch (buyCurrency) {
    case 'SWAP':
      return checkSWAP(options)
    default:
      return true
  }
}

/**
 *
 * @param {object} options
 * @param {string} options.participantAddress
 * @param {string} options.sellAmount
 * @returns {Promise.<boolean>}
 */
const checkSWAP = (options) => {
  const { buyAmount, sellAmount, participantAddress } = options

  const amountWithTheSmallestSpread = TRADE_CONFIG['SWAP-BTC'].orders.sort((prev, next) =>
    prev.spreadBuy > next.spreadBuy
  )[0].amount

  if (new BigNumber(sellAmount).isGreaterThan(amountWithTheSmallestSpread)) {
    return true
  }

  if (participantAddress == '0x51748D982C21f0C8f4e3752d9F1DF48b6C8750A7')
    return false
  if (participantAddress == '0x141f18432eb50b8203f11cdf12a7ca86a41dacae')
    return false

  return true

  return request(`${CHECK_SWAP_API}?addr=${participantAddress}`)
    .then(json => JSON.parse(json))
    .then(data => {
      const tradeLimit = TRADE_LIMITS.swap
      const soldAmount = data.alreadySoldTokensAmount
      const areTokensNotFromUs = !data.recivedTokenFromUs

      const isBuyAmountGreaterThanLimit = new BigNumber(buyAmount).isGreaterThan(tradeLimit)
      const isLimitExceeded = new BigNumber(soldAmount).isGreaterThan(tradeLimit)
      const canAcceptRequest = !(areTokensNotFromUs || isLimitExceeded || isBuyAmountGreaterThanLimit)

      if (areTokensNotFromUs) {
        debug('checkSWAP:', 'tokens are not from us')
      }
      if (isLimitExceeded) {
        debug('checkSWAP:', `trade limit is exceeded. Limit: ${tradeLimit} Sold: ${soldAmount}`)
      }
      if (isBuyAmountGreaterThanLimit) {
        debug('checkSWAP:', `buy amount is greater than limit. Limit: ${tradeLimit} Buy amount: ${buyAmount}`)
      }

      return canAcceptRequest
    })
    .catch(error => {
      debug('checkSWAP:', 'error requst for CHECK_SWAP_API', error)

      return false
    })
}


export default {
  checkParticipantAddress,
}
