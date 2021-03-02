import _debug from 'debug'

import history from '../../core/history'
import beginSwap from '../start/beginSwap'


const debug = _debug('swap.bot:history')


export default async (app) => {
  const processing = history.getAllInProgress()
  debug('[SAVED]: ', processing.join(','))

  const shouldStart = process.env.START_SAVED != 'disable'
  debug('[SAVED]: will start all =', shouldStart)

  const beginSwaps = (shouldStart ? processing : [])
    .map(id => new Promise(resolve => beginSwap(app, { id }, resolve)))

  const swaps = Promise.all(beginSwaps)

  return swaps
}
