import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Input.scss'

const Input = ({ icon, currency }) => (
    <div styleName="trade-panel__group">
        <input type="number" placeholder="0" styleName="trade-panel__input" />

        <div styleName="trade-panel__label trade-panel__label_row">
            <div styleName="trade-panel__select" className="btn-group">
                <button type="button" styleName="trade-panel__btn" className="btn dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span styleName={'trade-panel__icon ' +  icon}></span> { currency }
                </button>
                <div className="dropdown-menu">
                    <input styleName="trade-panel__search-field" type="search" tabIndex="0" autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck="false" role="textbox" placeholder="Search token" />
                    <a className="dropdown-item" href="#"><span styleName="trade-panel__icon icon-btc"></span> {currency}</a>
                    <a className="dropdown-item" href="#"><span styleName="trade-panel__icon icon-eth"></span> ETH</a>
                </div>
            </div>
        </div>
    </div>
)

export default CSSModules(Input, styles, { allowMultiple: true })