import Swap from 'swap.swap'

import { on } from './on'
import checkService from './checkService'

export const ready = room => {
  checkService(room, 'room')

  return on(room, 'ready')
}
