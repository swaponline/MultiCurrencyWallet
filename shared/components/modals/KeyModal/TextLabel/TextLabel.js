import React from 'react'
import PropTypes from 'prop-types'
import actions from 'redux/actions'

import Modal from 'components/modal/Modal/Modal'

import CSSModules from 'react-css-modules'
import styles from './TextLabel.scss'


@CSSModules(styles)
export default class TextLabel extends React.Component {

  static propTypes = {
    privateKey: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }

  isSave = () => {
    const { key } = this
    key.focus()
    key.select()
    document.execCommand('copy')
  }

  render() {
    const { privateKey, name } = this.props
    return (
      <div styleName="wrap">
        <p styleName="name">{name.toUpperCase()}</p>
        <textarea
          styleName="txt"
          readOnly="readonly"
          ref={textarea => this.key = textarea}
          wrap="off"
          defaultValue={privateKey} />
        <a href="#" onClick={this.isSave}> Copy</a>
      </div>
    )
  }
}
