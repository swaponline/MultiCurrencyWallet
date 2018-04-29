import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Coin.scss'

import coin1 from './coin-1.svg'
import coin2 from './coin-2.svg'

const Coin = () =>  (
    <div className="confirm__coins">
        <div className="confirm__left-coin"><img src={coin1} alt=""/></div>
        <div className="confirm__right-coin"><img src={coin2} alt=""/></div>
    </div>
)

export default CSSModules(Coin, styles)