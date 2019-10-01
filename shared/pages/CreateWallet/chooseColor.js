import React from 'react'

import { isMobile } from 'react-device-detect'


export const color = (step, el) => {
  if (step === el) {
    return 'purple'
  } else if (isMobile ? el < step : el > step) {
    return 'green'
  }
  return ''
}
