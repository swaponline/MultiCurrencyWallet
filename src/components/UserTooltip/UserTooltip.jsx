import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './UserTooltip.scss'

import ArrowRightSvg from './arrow-right.svg'
import AcceptSvg from './accept.svg'

const UserTooltip = () => {
    <div styleName="user-tooltip">
        <div className="user-tooltip__info">
            <div styleName="user-tooltip__info-title">User want to swap</div>
            <div styleName="user-tooltip__currency">
                <span className="user-tooltip__from">10 <span styleName="user-tooltip__coin">eth</span></span>
                <span styleName="user-tooltip__arrow"><img src={ArrowRightSvg} alt=""/></span>
                <span className="user-tooltip__to">1 <span styleName="user-tooltip__coin">btc</span></span>
            </div>
        </div>

        <div styleName="user-tooltip__checked">
            <img src={AcceptSvg} alt=""/>
        </div>
    </div>
}

export default CSSModules(UserTooltip, styles)