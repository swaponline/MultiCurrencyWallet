import React, { Component, Fragment } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'

import { Link, withRouter } from 'react-router-dom'
import { links, constants } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './Logo.scss'

import ThemeTooltip from '../../ui/Tooltip/ThemeTooltip'

import logoBlack from 'shared/images/logo/logo-black.svg'
import logoColored from 'shared/images/logo/logo-colored.svg'


/* uncomment to debug */
//window.logoUrl = 'https://wallet.wpmix.net/wp-content/uploads/2020/07/yourlogohere.png'
//window.logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/640px-Samsung_Logo.svg.png'
//window.logoUrl = 'https://www.laocommerce.com/wp-content/uploads/2020/05/logo.png'
//window.logoUrl = 'https://www.swappeers.com/wp-content/uploads/2020/10/sp-1.png'
//window.logoUrl = 'https://www.business.bet/images/bb.svg'
//window.darkLogoUrl = ...
//window.logoUrl = "#"
//window.LOGO_REDIRECT_LINK = 'https://www.google.com/'


const isDark = localStorage.getItem(constants.localStorage.isDark)
const isMainnet = process.env.MAINNET

@withRouter
@CSSModules(styles, { allowMultiple: true })
class Logo extends Component<any, {}> {

  render() {
    const {
      intl: { locale },
    } = this.props;

    const isCustomLogo = window.logoUrl !== '#'
    const customLogoUrl = isDark ?
      window.darkLogoUrl || window.logoUrl
      :
      window.logoUrl

    const isCustomLogoLink = window.LOGO_REDIRECT_LINK as boolean
    const customLogoLink = window.LOGO_REDIRECT_LINK

    const imgSrc = isCustomLogo ?
      customLogoUrl
      :
      isMainnet ? logoColored : logoBlack

    const imgAlt = window.location.hostname

    const goToUrl = isCustomLogoLink ? customLogoLink : links.home

    return (
      <div styleName="logoWrapper">
        {isCustomLogoLink ?
          <a href={goToUrl}>
            <img src={imgSrc} alt={imgAlt} />
          </a>
          :
          <Fragment>
            <Link to={goToUrl} data-tip data-for="logo">
              <img src={imgSrc} alt={imgAlt} />
            </Link>
            <ThemeTooltip id="logo" effect="solid" place="bottom">
              <FormattedMessage id="logo29" defaultMessage="Go Home" />
            </ThemeTooltip>
          </Fragment>
        }
      </div>
    );
  }
}

export default injectIntl(Logo)
