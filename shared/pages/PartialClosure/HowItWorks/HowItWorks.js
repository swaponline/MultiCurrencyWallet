import React from 'react'
import PropTypes from 'prop-types'

import { FormattedMessage } from 'react-intl'

import CSSModules from 'react-css-modules'
import styles from './HowItWorks.scss'


const HowItWorks = ({ className }) => (
  <div styleName="HowItWorksContainer">
    <h3 styleName="HowItWorksTitle">
      <FormattedMessage id="HowItWorks10" defaultMessage="How it works?" />
    </h3>
    <div styleName="HowItWorksList">
      <div styleName="HowItWorksItem">
        <span styleName="HowItWorksStep">
          <FormattedMessage id="HowItWorks18" defaultMessage="1. Select a cryptocurrency and its amount" />
        </span>
        <span styleName="HowItWorksInfo">
          <FormattedMessage id="HowItWorks21" defaultMessage="Choose a cryptocurrency that you have at your disposal on any external wallet, exchange, or Swap Online wallet;" />
        </span>
      </div>
      <div styleName="HowItWorksItem">
        <span styleName="HowItWorksStep">
          <FormattedMessage id="HowItWorks26" defaultMessage="2. Click on Exchange." />
        </span>
        <span styleName="HowItWorksInfo">
          <FormattedMessage id="HowItWorks29" defaultMessage="If a suitable order is found and the seller confirms the exchange, you will be redirected to the exchange page;" />
        </span>
      </div>
      <div styleName="HowItWorksItem">
        <span styleName="HowItWorksStep">
          <FormattedMessage id="HowItWorks34" defaultMessage="3. Make a cryptocurrency deposit." />
        </span>
        <span styleName="HowItWorksInfo">
          <FormattedMessage id="HowItWorks37" defaultMessage="In case the required amount is available on the internal wallet, the deposit will be executed automatically;" />
        </span>
      </div>
      <div styleName="HowItWorksItem">
        <span styleName="HowItWorksStep">
          <FormattedMessage id="HowItWorks42" defaultMessage="4. Wait for the completion of the swap procedure." />
        </span>
        <span styleName="HowItWorksInfo">
          <FormattedMessage
            id="HowItWorks45"
            defaultMessage="Usually, the exchange takes about a minute. At the end of the procedure, you will see the txid and will be able to check the completion of the transfer." />
        </span>
      </div>
    </div>
  </div>
)

export default CSSModules(HowItWorks, styles)
