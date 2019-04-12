import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import { links } from 'helpers'
import { NavLink, withRouter } from 'react-router-dom'

import cx from 'classnames'
import styles from './Nav.scss'
import CSSModules from 'react-css-modules'
import { FormattedMessage, injectIntl } from 'react-intl'
import { localisedUrl } from 'helpers/locale'


@injectIntl
@withRouter
@CSSModules(styles, { allowMultiple: true })
export default class Nav extends Component {

  static propTypes = {
    menu: PropTypes.array.isRequired,
  }

  handleScrollToTopClick = (link) => {
    this.setState({ activeRoute: link })

    const scrollStep = -window.scrollY / (500 / 15)
    const scrollInterval = setInterval(() => {
      if (window.scrollY !== 0) {
        window.scrollBy(0, scrollStep)
      } else {
        clearInterval(scrollInterval)
      }
    }, 15)
  }

  render() {
    const { menu, intl: { locale } } = this.props

    return (
      <div styleName="nav">
        <Fragment>
          {
            menu
              .filter(i => i.isDesktop !== false)
              .map(({ title, link, exact, tour }) => (
                <NavLink
                  onClick={this.handleScrollToTopClick}
                  key={title}
                  data-tut={`${tour}`}
                  exact={exact}
                  styleName="link"
                  to={localisedUrl(locale, link)}
                  activeClassName={styles.active}
                >
                  {title}
                </NavLink>
              )
              )
          }
          <a href={links.listing} styleName="link" target="_blank" rel="noreferrer noopener">
            <FormattedMessage id="Nav88" defaultMessage="Listing" />
          </a>
        </Fragment>
      </div>
    )
  }
}
