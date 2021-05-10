import React from 'react'
import { NavLink } from 'react-router-dom'
import cssModules from 'react-css-modules'

import styles from './Href.scss'

interface HrefProps {
  children: React.ReactNode
  to?: string
  redirect?: string
  tab?: string
  rel?: string
  className?: string
}

const Href = ({ children, to, redirect, tab, rel, className }: HrefProps) => {
  if (to) {
    return (
      <NavLink styleName="link" to={to}>
        {children}
      </NavLink>
    )
  }

  return (
    <a
      styleName="link"
      className={className}
      href={redirect || tab}
      //@ts-ignore: strictNullChecks
      target={tab ? '_blank' : null}
      //@ts-ignore: strictNullChecks
      rel={rel || null}
    >
      {children}
    </a>
  )
}

export default cssModules(Href, styles)
