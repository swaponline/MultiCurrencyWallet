import React, { Component, Fragment } from 'react'

import CSSModules from 'react-css-modules'


const SwitchLang = ({ className, children, href }) => (
  <a className={className} style={{ color: 'white' }} href={href}>{children}</a>
)

export default SwitchLang
