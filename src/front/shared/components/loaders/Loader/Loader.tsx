import React from "react";
import PropTypes from "prop-types";

import CSSModules from "react-css-modules";
import styles from "./Loader.scss";

import { FormattedMessage } from "react-intl";

import config from "app-config";

const isWidget = config && config.isWidget

const Loader = ({ overlayClassName, data, showMyOwnTip }) => (
  <div styleName="overlay" className={overlayClassName}>
    <div>
      {window.loaderLogoUrl && (
        <img styleName="loaderImg" src={window.loaderLogoUrl} alt="Loader logo"/>
      )}
      {data && data.txId && (
        <p styleName="text">
          <FormattedMessage
            id="Loader21"
            defaultMessage="Please wait, it takes from 3 to 5 minutes to complete the transaction."
          />
        </p>
      )}
      {data && data.txId && (
        <a href={data.txId} styleName="link" target="_blank" rel="noopener noreferrer">
          {data.txId}
        </a>
      )}
      {!isWidget && Boolean(showMyOwnTip) && <div styleName="tips">{showMyOwnTip}</div>}
    </div>
  </div>
);

Loader.propTypes = {
  overlayClassName: PropTypes.string,
  className: PropTypes.string,
  data: PropTypes.shape({
    txId: PropTypes.string
  })
};

Loader.deafultProps = {
  data: null
};

export default CSSModules(Loader, styles, { allowMultiple: true });