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
export default class Logo extends Component {
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

    const srcFiles = isColored ? images.colored : images.common;
    const { host, href } = window.location;
    const file = Object.keys(srcFiles).find(el => window.location.href.includes(el)) || "base";

    const imgNode = React.createElement("img", {
      styleName: !withLink && "logo",
      src: srcFiles[file],
      alt: `${host}`
    });

    return (
      <Fragment>
        {window.location.hostname === "localhost" ||
        window.location.hostname === "swaponline.github.io" ||
        window.location.hostname === "swaponline.io" ? (
          <Link
            styleName={`${mobile ? "mobile" : "logo"}`}
            data-tip
            data-for="logo"
            to={localisedUrl(locale, links.home)}
          >
            {imgNode}
          </Link>
        ) : (
          <div>
            <img style={{ maxWidth: "55px" }} src={window.logoUrl} alt="Wallet" />
          </div>
        )}
      </Fragment>
    );
  }
}
