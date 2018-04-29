import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Description.scss'

import Filter from './Filter/Filter'

const Description = ({ title, subtitle, filter = false  }) => (
    <div styleName="description">
        <div className="container">
            { title !== '' ? <h2 styleName="description__title">{title}</h2> : '' }
            <h3 styleName="description__sub-title">{subtitle}</h3>
            {filter ? <Filter /> : ''}
        </div>
    </div>
)

export default CSSModules(Description, styles)