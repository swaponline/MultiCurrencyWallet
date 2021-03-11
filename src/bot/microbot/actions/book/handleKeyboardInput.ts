import BigNumber from 'bignumber.js'

import handleError from '../../../app/actions/errors/handleError'
import fillOrderbook from './fillOrderbook'


export default (orders) => input => {
  const num = new BigNumber(input)

  if (!input || num.isZero()) return
  if (!BigNumber.isBigNumber(num)) return handleError(new Error(`wrong number ${input}`))

  fillOrderbook(num, orders)
}
