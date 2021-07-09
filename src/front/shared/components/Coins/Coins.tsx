import React from 'react'
import CSSModules from 'react-css-modules'
import styles from './Coins.scss'

import Coin from 'components/Coin/Coin'

type ComponentProps = {
  names: string[]
  size?: number
  className?: string
}

const Coins = (props: ComponentProps) => {
  const { className, names, size = 40 } = props

  return (
    <div styleName="coins" className={className}>
      <Coin name={names[0]} size={size} />
      <Coin name={names[1]} size={size} />
    </div>
  )
}

export default CSSModules(Coins, styles)

