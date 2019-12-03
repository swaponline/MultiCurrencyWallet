import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import { links } from 'helpers'
import { NavLink, withRouter } from 'react-router-dom'


import styles from './Nav.scss'
import CSSModules from 'react-css-modules'
import { injectIntl } from 'react-intl'
import { localisedUrl } from 'helpers/locale'


const checkOnExchange = (pathname) => {
  if (pathname.includes(links.wallet)) {
    return true
  }
  return false
}

@injectIntl
@withRouter
@CSSModules(styles, { allowMultiple: true })
export default class Nav extends Component {

  static propTypes = {
    menu: PropTypes.array.isRequired,
  }

  handleScrollToTopClick = (link) => {
    this.setState({ activeRoute: link })
    //
    // const scrollStep = -window.scrollY / (500 / 15)
    // const scrollInterval = setInterval(() => {
    //   if (window.scrollY !== 0) {
    //     window.scrollBy(0, scrollStep)
    //   } else {
    //     clearInterval(scrollInterval)
    //   }
    // }, 15)
  }

  render() {
    const { menu, intl: { locale }, location } = this.props

    const isExchange = location.pathname.includes(links.exchange)

    return (
      <div styleName="nav">
        <Fragment>
          {menu
            .filter(i => i.isDesktop !== false)
            .map(({ title, link, exact, tour, haveSubmenu, index, isBold, ...rest }) => !rest.displayNone && (
              <div styleName="mainMenu" key={`${title} ${link}`}>
                <NavLink
                  onClick={this.handleScrollToTopClick}
                  key={index}
                  data-tut={title === 'Exchange' ? 'reactour__exchange' : ''}
                  exact={exact}
                  /* eslint-disable indent */
                  className={`
                      ${styles.link}
                      ${rest.currentPageFlag}
                      ${isExchange && styles.exchangeMenuLink}
                      ${isExchange ? ` ${styles.active_exchange}` : ''}
                      ${
                    checkOnExchange(link) && isExchange
                      ? ` ${styles.active}`
                      : ''
                    }
                    `}
                  /* eslint-enable indent */
                  to={localisedUrl(locale, link)}
                  activeClassName={styles.active} // it does not work in all cases, so it duplicates in className for some cases
                // im hurry, so fix it, if you are here
                >
                  <div>
                    {/* rest.currentPageFlag && (
                      <img src={ArrowDown} className={styles.arrowSub} alt="Open submenu" />
                    ) */}
                    {title}
                  </div>
                </NavLink>
                <div>
                  {/* haveSubmenu && <SubMenu history={history} locale={locale} key={index} /> */}
                </div>
              </div>
            ))
          }
        </Fragment>
      </div>
    )
  }
}
