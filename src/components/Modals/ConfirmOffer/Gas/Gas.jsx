import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Gas.scss'

const Gas = () => (
    <div className="confirm__row">
        <div className="confirm__title">Miner fee</div>
        <div className="confirm__fee">0.001 <span className="confirm__cur"> icx</span></div>
    </div>
)


export default CSSModules(Gas, styles)

