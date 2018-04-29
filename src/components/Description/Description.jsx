import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Description.scss'

import Filter from './Filter/Filter'

const Description = ({ title, subtitle, filter = false  }) => (
    <div className="description">
        <div className="container">
            { title !== '' ? <h2 className="description__title">{title}</h2> : '' }
            <h3 className="description__sub-title">{subtitle}</h3>
            {filter ? <Filter /> : ''}
        </div>
    </div>
)

export default CSSModules(Description, styles)