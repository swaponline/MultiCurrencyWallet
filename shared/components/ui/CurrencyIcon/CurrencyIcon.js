import React from 'react'

import cssModules from 'react-css-modules'
import styles from './CurrencyIcon.scss'

import btc from './images/btc.svg'
import eth from './images/eth.svg'
import icx from './images/icx.svg'
import waves from './images/waves.svg'
import xrp from './images/xrp.svg'
import bch from './images/bch.svg'
import nim from './images/nim.svg'
import eos from './images/eos.svg'
import swap from './images/swap.svg'
import usdt from './images/usdt.svg'
import syc from './images/syc.svg'
import bee from './images/bee.svg'
import drt from './images/drt.svg'
import omg from './images/omg.svg'
import yup from './images/yup.svg'
import kn from './images/kn.svg'


const icons = {
  btc,
  kn,
  bee,
  bch,
  drt,
  omg,
  eth,
  syc,
  icx,
  usdt,
  swap,
  waves,
  xrp,
  eos,
  yup,
  nim,
}

export const iconNames = Object.keys(icons)


const CurrencyIcon = ({ className, style, name }) => {
  const isIconExist = iconNames.includes(name.toLowerCase())

  if (isIconExist) {
    return (
      <img
        className={className}
        src={icons[name]}
        alt={`${name} icon`}
        role="image"
      />
    )
  }

  return (
    <span
      role="letter"
      styleName="text"
      className={className}
      style={style}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  )
}


export default cssModules(CurrencyIcon, styles)
