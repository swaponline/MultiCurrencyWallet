import React, { Fragment } from "react";

import Logo from "./Logo";

import ThemeTooltip from "../ui/Tooltip/ThemeTooltip";
import { FormattedMessage, injectIntl } from "react-intl";

const LogoTooltip = (props) => (
  <Fragment>
    <Logo withLink isColored={props.isColored} isExchange={props.isExchange} />
    <ThemeTooltip id="logo" effect="solid" place="bottom">
      <FormattedMessage id="logo29" defaultMessage="Go Home" />
    </ThemeTooltip>
  </Fragment>
);

export default LogoTooltip;
