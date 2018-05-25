import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redaction'
import actions from 'redux/actions'

import Modal from 'components/modal/Modal/Modal'

import CSSModules from 'react-css-modules'
import styles from './TextLabel.scss'


@CSSModules(styles)
export default class TextLabel extends React.Component {

  isSave = () => {
    const { key } = this
    key.focus()
    key.select()
    document.execCommand('copy')
  }

  render() {
    const { privateKey, isSave, name } = this.props
    return (
      <div styleName="wrap">
        <textarea
          styleName="txt"
          readOnly="readonly"
          ref={textarea => this.key = textarea}
          wrap="off"
          defaultValue={`${name}: ${privateKey}`} />
        <a href="#" onClick={this.isSave}> Copy</a>
      </div>
    )
  }
}
