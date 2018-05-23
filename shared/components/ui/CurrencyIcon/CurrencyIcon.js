import React from 'react'

import btc from './images/btc.svg'
import eth from './images/eth.svg'
import icx from './images/icx.svg'
import waves from './images/waves.svg'
import xrp from './images/xrp.svg'


const icons = {
  btc,
  eth,
  icx,
  waves,
  xrp,
  noxon: xrp,
}


const CurrencyIcon = ({ className, name }) => (
  <img className={className} src={icons[name]} alt={`${name} icon`} />
)

export default CurrencyIcon
