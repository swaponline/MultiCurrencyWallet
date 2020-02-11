import React, { Fragment } from "react";
import PropTypes from "prop-types";

import CSSModules from "react-css-modules";
import Button from "components/controls/Button/Button";
import styles from "./NotifyBlock.scss";

const NotifyBlock = ({ className, icon, descr, tooltip, firstBtn, secondBtn, firstFunc, secondFunc }) => (
  <div styleName={`notifyBlock ${className}`}>
    {/* <div styleName="notifyBlockIcon">
        <img src={icon} alt=""/>
      </div> */}
    <div styleName="notifyBlockDescr">
      <p>{descr}</p>
      {/* <p>{tooltip}</p> */}
    </div>
    {/* <div>
      {
        firstBtn && <Button white onClick={firstFunc}>
          {firstBtn}
        </Button>
      }
      {
        secondBtn && <Button transparent onClick={secondFunc}>
          {secondBtn}
        </Button>
      }
    </div> */}
  </div>
);

export default CSSModules(NotifyBlock, styles, { allowMultiple: true });
