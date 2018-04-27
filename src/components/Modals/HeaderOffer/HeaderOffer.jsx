import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './HeaderOffer.scss'

function HeaderOffer({ isClose }) {
    return(
        <div styleName="offer-popup__header">
            <div className="container">
                <div styleName="offer-popup__logo">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="30" viewBox="0 0 32 30">
                        <g fill="#9a2ff0" fillRule="evenodd">
                            <path d="M0 3.75L7.5 0v29.75L0 27.25zM11.5 5.5l7.5-2V26l-7.5-2.25zM23 8h9l-9 11.5z"/>
                        </g>
                    </svg>
                </div>
                <div styleName="offer-popup__close" onClick={isClose}></div>
            </div>
        </div>
    )
}

export default CSSModules(HeaderOffer, styles)