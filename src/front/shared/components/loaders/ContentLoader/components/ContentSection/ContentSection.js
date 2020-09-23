import React, { Fragment, useState } from 'react'
import CSSModules from 'react-css-modules'

import styles from '../../ContentLoader.scss'


const ContentSection = () => (
  <div styleName="container content">
    <div styleName="one" />
    <div styleName="two" />
    <div styleName="three" />
    <div styleName="four" />
    <div styleName="five" />
    <div styleName="six" />
  </div>
)

export default CSSModules(ContentSection, styles, { allowMultiple: true })
