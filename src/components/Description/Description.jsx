import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Description.scss'

const Description = ({ title, subtitle  }) => (
    <div styleName="description">
        <div className="container">
            { title !== '' ? <h2 styleName="description__title">{title}</h2> : '' }
            <h3 styleName="description__sub-title">{subtitle}</h3>
        </div>
    </div>
)

export default CSSModules(Description, styles)