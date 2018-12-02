import React, { Component, Fragment } from 'react'

import CSSModules from 'react-css-modules'


const SwitchLang = ({ className, children, onClick, href }) => (
  <a className={className} style={{ color: 'white' }} onClick={onClick} href={href}>{children}</a>
)

export default SwitchLang
