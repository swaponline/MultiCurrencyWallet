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

    const isColored = true // todo

    const imgSrc = isColored ? logoColored : logoBlack
    const { host, href } = window.location


    const onLogoClickLink = (window && window.LOGO_REDIRECT_LINK) ? window.LOGO_REDIRECT_LINK : localisedUrl(locale, links.home)
    const hasOwnLogoLink = (window && window.LOGO_REDIRECT_LINK)


    //const isCustomLogo = /*test*/ false || window.logoUrl !== "#"
    const isCustomLogoLink = window.LOGO_REDIRECT_LINK as boolean
    const customLogoSrc = /*test*/ 'https://wallet.wpmix.net/wp-content/uploads/2020/07/yourlogohere.png' || (isDark ? window.darkLogoUrl : window.logoUrl)

    //const onLogoClickLink = isCustomLogoLink
      ? window.LOGO_REDIRECT_LINK
      : localisedUrl(locale, links.home);

    return (
      <div styleName="logoWrapper">
        {isOurDomain
          ?
          <Fragment>
            {hasOwnLogoLink ? (
              <a
                href={onLogoClickLink}
                //styleName="logo"
                data-tip
                data-for="logo"
              >
                <img
                  src={imgSrc}
                  alt={host}
                />
              </a>
              ) : (
              <Link
                to={onLogoClickLink}
                //styleName="logo"
                data-tip
                data-for="logo"
              >
                <img
                  src={imgSrc}
                  alt={host}
                />
              </Link>
            )}
          </Fragment>
          :
          <div>
            {isCustomLogo && (
              <img src={window.logoUrl} alt="Wallet" />
            )}
          </div>
        }

        {/*moved*/}
        {isCustomLogoLink ? (
          <a href={onLogoClickLink}>
            <img src={customLogoSrc} />
          </a>
        ) : (
          <Link to={onLogoClickLink}>
            <img src={customLogoSrc} />
          </Link>
        )}
        {/*/moved*/}

        <ThemeTooltip id="logo" effect="solid" place="bottom">
          <FormattedMessage id="logo29" defaultMessage="Go Home" />
        </ThemeTooltip>
      </div>
    );
  }
}
