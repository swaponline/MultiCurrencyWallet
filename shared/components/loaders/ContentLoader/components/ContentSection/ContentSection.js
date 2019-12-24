import React, { Fragment, useState } from 'react'
import CSSModules from 'react-css-modules'

import styles from '../../ContentLoader.scss'

const ContentSection = () => (
    <div styleName="container content">
        <div styleName="one"></div>
        <div styleName="two"></div>
        <div styleName="three"></div>
        <div styleName="four"></div>
        <div styleName="five"></div>
        <div styleName="six"></div>
    </div>
)
    
export default CSSModules(ContentSection, styles, { allowMultiple: true })