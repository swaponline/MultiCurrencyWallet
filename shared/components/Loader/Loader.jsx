import React from 'react'
import { connect } from 'redaction'

import CSSModules from 'react-css-modules'
import styles from './Loader.scss'


const Loader = ({ isFetching }) => isFetching && (
  <div styleName="overlay">
    <div styleName="loader center">
      <div styleName="loader1" />
      <div styleName="loader2" />
      <div styleName="loader3" />
    </div>
  </div>
)


export default connect({
  isFetching: 'loader.visible',
})(CSSModules(Loader, styles, { allowMultiple: true }))
