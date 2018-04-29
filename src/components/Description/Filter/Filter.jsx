import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Filter.scss'

const Filter = () => (
    <div className="history-filter">
        <a href="#" className="history-filter__item history-filter__item_active">All</a>
        <a href="#" className="history-filter__item">Sent</a>
        <a href="#" className="history-filter__item">Received</a>
    </div>
)

export default CSSModules(Filter, styles, { allowMultiple: true })