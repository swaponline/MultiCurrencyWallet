import React from 'react'
import PropTypes from 'prop-types'

import { NavLink } from 'react-router-dom'

import cssModules from 'react-css-modules'
import styles from './Href.scss'


const Href = ({ children, to, redirect, tab, rel, className }) => {
  if (to) {
    return (
      <NavLink styleName="link">{children}</NavLink>
    )
  }

  return (
    <a
      styleName="link"
      className={className}
      href={redirect || tab}
      target={tab ? '_blank' : null}
      rel={rel || null}
    >
      {children}
    </a>
  )
}

Href.propTypes = {
  children: PropTypes.node.isRequired,
  to: PropTypes.string,
  redirect: PropTypes.string,
  tab: PropTypes.string,
  rel: PropTypes.string,
  className: PropTypes.string,
}

export default cssModules(Href, styles)
