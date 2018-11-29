import React, { Component, Fragment } from 'react'

import CSSModules from 'react-css-modules'


export default class SwitchLang extends Component {

  render() {
    const { intl: { locale }, className, children, onClick, href  } = this.props

    return (
      <a className={className} style={{ color: 'white' }} onClick={onClick} href={href}>{children}</a>
    )
  }

}
