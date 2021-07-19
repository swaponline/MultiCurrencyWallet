import React, { Component, Fragment } from 'react'
import { NavLink, withRouter } from 'react-router-dom'
import CSSModules from 'react-css-modules'
import { injectIntl } from 'react-intl'
import styles from './Nav.scss'
import { localisedUrl } from 'helpers/locale'

type NavProps = {
  menu: IUniversalObj[]
  intl: any
}

//@ts-ignore: strictNullChecks
@withRouter
@CSSModules(styles, { allowMultiple: true })
class Nav extends Component<NavProps, null> {
  render() {
    const {
      menu,
      intl: { locale },
    } = this.props

    return (
      <div styleName='nav'>
        <Fragment>
          {menu
            .filter(i => i.isDesktop !== false)
            .map((item, index) => {
              const { title, link, exact, isExternal } = item

              return (
                <div styleName='mainMenu' key={index} className="data-tut-widget-tourFinish">
                  {isExternal ? (
                    <a
                      href={link}
                      target="_blank"
                      styleName="link"
                    >
                      {title}
                    </a>
                  ) : (
                    <NavLink
                      key={index}
                      exact={exact}
                      className={`
                        ${styles.link}
                        ${link && link.includes('exchange') ? 'reactour-exchange data-tut-widget-exchange' : ''}
                      `}
                      to={localisedUrl(locale, link)}
                      activeClassName={styles.active}
                    >
                      {title}
                    </NavLink>
                  )}
                </div>
              );
            })}
        </Fragment>
      </div>
    );
  }
}

//@ts-ignore: strictNullChecks
export default injectIntl(Nav)
