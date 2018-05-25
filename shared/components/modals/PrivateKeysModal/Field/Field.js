import React from 'react'
import PropTypes from 'prop-types'
import Link from 'sw-valuelink'

import CSSModules from 'react-css-modules'
import styles from './Field.scss'

import Input from 'components/forms/Input/Input'


@CSSModules(styles)
export default class Field extends React.Component {

  static propTypes = {
    label: PropTypes.string.isRequired,
    privateKey: PropTypes.string.isRequired,
  }

  isSave = () => {
    this.input.focus()
    this.input.select()
    document.execCommand('copy')
  }

  render() {
    const { label, privateKey } = this.props

    return (
      <div styleName="wrap">
        <div styleName="name">{label.toUpperCase()}</div>
        <Input
          ref={(el) => this.input = el}
          valueLink={Link.value(privateKey)}
          readOnly
        />
        <a href="#" onClick={this.isSave}> Copy</a>
      </div>
    )
  }
}
