import React from 'react'
import AddSvg from './add.svg'

import CSSModules from 'react-css-modules'
import styles from './User.scss'

import UserTooltip from '../UserTooltip/UserTooltip'

function User({ isOpen }) {
    function Open(event) {
        event.preventDefault()
        isOpen()
    }
    return(
        <div styleName="user-cont">
        <a href="#" styleName="user-cont__help">?</a>
        <a href="" styleName="user-cont__add-user" onClick={ Open }><img src={AddSvg} alt=""/></a>

        <div className="users">
            <div styleName="users__user">
                <span styleName="users__user-letter">K</span>
                <span styleName="users__user-status"> </span>
            </div>
        </div>

        <UserTooltip />

    </div>
    )
}

export default CSSModules(User, styles)