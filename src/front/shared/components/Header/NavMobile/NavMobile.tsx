import React, { Component } from 'react'
import { NavLink, withRouter } from 'react-router-dom'
import { injectIntl } from 'react-intl'

import CSSModules from 'react-css-modules'
import styles from './NavMobile.scss'
import { localisedUrl } from 'helpers/locale'
import config from 'helpers/externalConfig'


type NavProps = {
  menu: IUniversalObj[]
  isHidden?: boolean
  intl: any
}

type NavMobileState = {
  ownMenuShowed: boolean
}
//@ts-ignore: strictNullChecks
@withRouter
@CSSModules(styles, { allowMultiple: true })
class NavMobile extends Component<NavProps, NavMobileState> {
  
  constructor(props) {
    super(props)
    this.state = {
      ownMenuShowed: false,
    }
  }

  toggleOwnMenu = () => {
    const { ownMenuShowed } = this.state
    this.setState({
      ownMenuShowed: !ownMenuShowed,
    })
  }

  hideOwnMenu = () => {
    this.setState({
      ownMenuShowed: false,
    })
  }

  render() {
    const {
      menu,
      intl: { locale },
      isHidden,
    } = this.props
    const { ownMenuShowed } = this.state

    const beforeMenuItems = config.opts.ui.menu.before
    const afterMenuItems = config.opts.ui.menu.after
    const ownMenuItems = [
      ...beforeMenuItems,
      ...afterMenuItems,
    ]

    let dropDownMenu = null
    if (ownMenuItems.length) {
      // @ts-ignore
      dropDownMenu = (
        <>
          <div onClick={this.hideOwnMenu.bind(this)} styleName={`navbar-dropmenu-bg ${ownMenuShowed ? 'active' : ''}`}></div>
          <div styleName={`navbar-dropmenu ${ownMenuShowed ? 'active' : ''}`}>
          {
            ownMenuItems.map((item, index) => {
              const { title, link, newwindow } = item
              return (
                <a
                  onClick={this.hideOwnMenu.bind(this)}
                  href={link}
                  key={index}
                  target={(newwindow) ? `_blank` : `_self`}
                >
                  {title}
                </a>
              )
            })
          }
          </div>
        </>
      )
    }
    return (
      <nav>
        {dropDownMenu}
        <div styleName={`navbar ${isHidden ? 'navbar-hidden' : ''}`}>
          {ownMenuItems.length > 0 && (
            <a onClick={this.toggleOwnMenu.bind(this)} styleName={`show-own-menu ${ownMenuShowed ? 'active' : ''}`}>
              <i className="fa fa-bars" aria-hidden="true"></i>
            </a>
          )}
          {menu
            .filter(i => i.isMobile !== false)
            .map((item, index) => {
              const {
                title,
                link,
                exact,
                icon,
                isBold,
                isExternal,
                currentPageFlag,
                displayNone,
              } = item

              if (isExternal) {
                return (
                  <a href={link} target="_blank" key={index}>
                    {icon}
                    <span className={isBold && styles.bold}>{title}</span>
                  </a>
                )
              }

              return !displayNone && currentPageFlag ? (
                  <a
                    key={index}
                    href={link}
                    tabIndex={-1}
                  >
                    {icon}
                    <span className={isBold && styles.bold}>{title}</span>
                  </a>
                ) : (
                  <NavLink
                    key={index}
                    exact={exact}
                    to={localisedUrl(locale, link)}
                    className={`
                      ${link && link.includes("history") ? 'data-tut-recent' : ''}
                      ${link && link.includes("exchange") ? 'reactour-exchange data-tut-widget-exchange' : ''}
                    `}
                    activeClassName={ownMenuShowed ? styles.bold : styles.active}
                  >
                    {icon}
                    <span className={isBold && styles.bold}>{title}</span>
                  </NavLink>
                )
            })
          }
        </div>
      </nav>
    )
  }
}

//@ts-ignore: strictNullChecks
export default injectIntl(NavMobile)
