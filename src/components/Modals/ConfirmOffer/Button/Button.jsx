import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Button.scss'

function Button({ isBack }) {
    return(
        <div styleName="confirm__buttons">
            <a href="#" styleName="confirm__back" onClick={isBack}>Back</a>
            <a href="#" styleName="confirm__submit" >Confirm</a>
        </div>
    )
}

export default CSSModules(Button, styles)

