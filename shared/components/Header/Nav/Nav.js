import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import { links } from 'helpers'
import { NavLink, withRouter } from 'react-router-dom'

import SubMenu from '../SubMenu/SubMenu'

import cx from 'classnames'
import styles from './Nav.scss'
import CSSModules from 'react-css-modules'
import { FormattedMessage, injectIntl } from 'react-intl'
import { localisedUrl } from 'helpers/locale'

import ArrowDown from './images/ArrowDown.svg'


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
    const { menu, intl: { locale }, history } = this.props

    return (
      <div styleName="nav">
        <Fragment>
          <div styleName="container">
            <div styleName="humburger" />
            <div styleName="humburger" />
            <div styleName="humburger" />
          </div>
          {menu
            .filter(i => i.isDesktop !== false)
            .map(({ title, link, exact, tour, haveSubmenu, index, isBold, ...rest }) => (
              <div styleName="mainMenu">
                <NavLink
                  onClick={this.handleScrollToTopClick}
                  key={index}
                  data-tut={`${tour}`}
                  exact={exact}
                  className={`${styles.link} ${rest.currentPageFlag && styles['fixed-width']}`}
                  to={localisedUrl(locale, link)}
                >
                  <span className={isBold && styles.bold}>{title}</span>
                  { rest.currentPageFlag && (
                    <img src={ArrowDown} className={styles.arrowSub} alt="Open submenu" />
                  ) }
                </NavLink>
                <div>
                  {haveSubmenu && <SubMenu history={history} locale={locale} key={index} />}
                </div>
              </div>
            ))
          }
        </Fragment>
      </div>
    )
  }
}
