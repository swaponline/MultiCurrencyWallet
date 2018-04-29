import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Filter.scss'

const Filter = () => (
    <div styleName="history-filter">
        <a href="#" styleName="history-filter__item history-filter__item_active">All</a>
        <a href="#" styleName="history-filter__item">Sent</a>
        <a href="#" styleName="history-filter__item">Received</a>
    </div>
)

export default CSSModules(Filter, styles, { allowMultiple: true })