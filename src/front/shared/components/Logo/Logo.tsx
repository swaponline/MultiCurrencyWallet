import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";

import { Link, withRouter } from "react-router-dom";
import { links } from "helpers";

import CSSModules from "react-css-modules";
import styles from "./Logo.scss";

import { injectIntl } from "react-intl";
import { localisedUrl } from "helpers/locale";
import images from "./images";

@withRouter
@injectIntl
@CSSModules(styles, { allowMultiple: true })
export default class Logo extends Component<any, any> {
  static propTypes = {
    isColored: PropTypes.bool,
    withLink: PropTypes.bool,
    mobile: PropTypes.bool
  };

  render() {
    const {
      isColored,
      withLink,
      mobile,
      intl: { locale },
      isExchange
    } = this.props;

    const isOurDomain = [
      "localhost",
      "swaponline.github.io",
      "swaponline.io"
    ].includes(window.location.hostname)

    const isCustomLogo = window.logoUrl !== '#'

    const srcFiles = isColored ? images.colored : images.common;
    const { host, href } = window.location;
    const file = Object.keys(srcFiles).find(el => window.location.href.includes(el)) || "base"
    const onLogoClickLink = (window && window.LOGO_REDIRECT_LINK) ? window.LOGO_REDIRECT_LINK : localisedUrl(locale, links.home)
    const hasOwnLogoLink = (window && window.LOGO_REDIRECT_LINK)

    const imgNode = React.createElement("img", {
      styleName: !withLink && "logo",
      src: srcFiles[file],
      alt: `${host}`
    });

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
      </Fragment>
    );
  }
}
