import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './NotFound.scss'

const NotFound = () => (
    <div className="container">
        <h2 className="description__sub-title">Такой страницы не существует</h2>
    </div>
)

export default CSSModules(NotFound, styles)