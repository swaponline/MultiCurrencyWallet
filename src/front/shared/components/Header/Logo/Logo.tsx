import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";

import { Link, withRouter } from "react-router-dom";
import { links, constants } from "helpers";

import CSSModules from "react-css-modules";
import styles from "./Logo.scss";

import { FormattedMessage, injectIntl } from "react-intl";
import { localisedUrl } from "helpers/locale";
import ThemeTooltip from "../../ui/Tooltip/ThemeTooltip";

import logoBlack from "shared/images/logo/logo-black.svg"
import logoColored from "shared/images/logo/logo-colored.svg"


const isDark = localStorage.getItem(constants.localStorage.isDark)


@withRouter
@injectIntl
@CSSModules(styles, { allowMultiple: true })
export default class Logo extends Component<any, any> {


/*

import base from './base.svg'
import baseColored from './baseColored.svg'

import swapOnline from './swapOnline.svg'
import swapOnlineColored from './swapOnlineColored.svg'


export default {
  colored: {
    base: baseColored,
    localhost: base,
    'swap.online': swapOnlineColored,
  },
  common: {
    base,
    'swap.online': swapOnline,
  },
}

*/

  render() {
    const {
      intl: { locale },
    } = this.props;

    const isOurDomain = [
      "localhost",
      "swaponline.github.io",
      "swaponline.io"
    ].includes(window.location.hostname)

    const isCustomLogo = window.logoUrl !== '#'

    const withLink = true // todo
    const isColored = true // todo

    const srcFiles = isColored ? logoColored : logoBlack
    const { host, href } = window.location

    const file = Object.keys(srcFiles).find(el => window.location.href.includes(el)) || "base"

    const onLogoClickLink = (window && window.LOGO_REDIRECT_LINK) ? window.LOGO_REDIRECT_LINK : localisedUrl(locale, links.home)
    const hasOwnLogoLink = (window && window.LOGO_REDIRECT_LINK)

    const imgNode = React.createElement("img", {
      styleName: !withLink && "logo",
      src: srcFiles[file],
      alt: `${host}`
    });

    //const isCustomLogo = /*test*/ false || window.logoUrl !== "#"
    const isCustomLogoLink = window.LOGO_REDIRECT_LINK as boolean
    const customLogoSrc = /*test*/ 'https://wallet.wpmix.net/wp-content/uploads/2020/07/yourlogohere.png' || (isDark ? window.darkLogoUrl : window.logoUrl)

    //const onLogoClickLink = isCustomLogoLink
      ? window.LOGO_REDIRECT_LINK
      : localisedUrl(locale, links.home);

    return (
      <Fragment>
        {isOurDomain
          ?
          <Fragment>
            {hasOwnLogoLink ? (
              <a
                href={onLogoClickLink}
                styleName="logo"
                data-tip
                data-for="logo"
              >
                {imgNode}
              </a>
              ) : (
              <Link
                styleName="logo"
                data-tip
                data-for="logo"
                to={onLogoClickLink}
              >
                {imgNode}
              </Link>
            )}
          </Fragment>
          :
          <div>
            {isCustomLogo && (
              <img styleName="otherLogoBrand" className="site-logo" src={window.logoUrl} alt="Wallet" />
            )}
          </div>
        }

        {/*moved*/}
        {isCustomLogoLink ? (
          <a href={onLogoClickLink}>
            <img styleName="customLogo" src={customLogoSrc} />
          </a>
        ) : (
          <Link to={onLogoClickLink}>
            <img styleName="customLogo" src={customLogoSrc} />
          </Link>
        )}
        {/*/moved*/}

        <ThemeTooltip id="logo" effect="solid" place="bottom">
          <FormattedMessage id="logo29" defaultMessage="Go Home" />
        </ThemeTooltip>
      </Fragment>
    );
  }
}
