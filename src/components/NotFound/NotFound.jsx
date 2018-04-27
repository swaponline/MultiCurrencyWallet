import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './NotFound.scss'

function NotFound() {
    return(
        <div className="container">
            <h2 styleName="description__sub-title">Такой страницы не существует</h2>
        </div>
    )
}

export default CSSModules(NotFound, styles)