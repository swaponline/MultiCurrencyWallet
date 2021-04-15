import React, { Component, Fragment } from 'react'
import { NavLink, withRouter } from 'react-router-dom'
import CSSModules from 'react-css-modules'
import { injectIntl } from 'react-intl'
import styles from './Nav.scss'

import { links, constants } from 'helpers'
import { localisedUrl } from 'helpers/locale'

type NavProps = {
  menu: IUniversalObj[]
  location?: IUniversalObj
  intl: any
}

@withRouter
@CSSModules(styles, { allowMultiple: true })
class Nav extends Component<NavProps, null> {
  handleScrollToTopClick = link => {
    this.setState({ activeRoute: link })
  };

  render() {
    const {
      menu,
      intl: { locale },
      location,
    } = this.props

    const isExchange = location.pathname.includes(links.exchange)

    const isWallet =
      location.pathname.includes(links.wallet) ||
      location.pathname === '/' ||
      location.pathname === '/ru'

    const isDark = localStorage.getItem(constants.localStorage.isDark)

    return (
      <div styleName='nav'>
        <Fragment>
          {menu
            .filter(i => i.isDesktop !== false)
            .map(el => {
              const {
                title,
                link,
                exact,
                index,
              } = el

              return (
                <div styleName='mainMenu' key={`${title} ${link}`} className="data-tut-widget-tourFinish">
                  <NavLink
                    onClick={this.handleScrollToTopClick}
                    key={index}
                    exact={exact}
                    /* eslint-disable indent */
                    className={`
                      ${styles.link}
                      ${title === 'Wallet' && isWallet ? ` ${styles.active}` : ''}
                      ${link && link.includes("exchange") ? 'reactour-exchange data-tut-widget-exchange' : ''}
                      ${link && link.includes("exchange") && isExchange ? ` ${styles.active}` : ''}
                      ${isDark ? styles.dark : ''}
                  `}
                    /* eslint-enable indent */
                    to={localisedUrl(locale, link)}
                    activeClassName={styles.active} // it does not work in all cases, so it duplicates in className for some cases
                  // im hurry, so fix it, if you are here
                  >
                    <div>
                      {title}
                    </div>
                  </NavLink>
                </div>
              );
            })}
        </Fragment>
      </div>
    );
  }
}

export default injectIntl(Nav)
