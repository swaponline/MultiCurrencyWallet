import base from './base.svg'
import baseColored from './baseColored.svg'

import swapOnline from './swapOnline.svg'
import swapOnlineColored from './swapOnlineColored.svg'


export default {
  colored: {
    base: baseColored,
    localhost: swapOnlineColored,
    'swap.online': swapOnlineColored,
  },
  common: {
    base,
    'swap.online': swapOnline,
  },
}
