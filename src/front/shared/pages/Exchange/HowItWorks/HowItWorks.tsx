import React from 'react'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './HowItWorks.scss'

const HowItWorks = () => (
  <div styleName="HowItWorksContainer">
    <h3 styleName="HowItWorksTitle">
      <FormattedMessage id="HowItWorks10" defaultMessage="How Does It Work" />
    </h3>
    <div styleName="HowItWorksList">
      <div styleName="HowItWorksItem">
        <span styleName="HowItWorksStep">
          <FormattedMessage id="HowItWorks18" defaultMessage="1. Select your cryptocurrency and the amount." />
        </span>
        <span styleName="HowItWorksInfo">
          <FormattedMessage id="HowItWorks21" defaultMessage="Choose a cryptocurrency that you have at your disposal on any external wallet, exchange, or Swap Online wallet" />
        </span>
      </div>
      <div styleName="HowItWorksItem">
        <span styleName="HowItWorksStep">
          <FormattedMessage id="HowItWorks26" defaultMessage="2. Click “Exchange”" />
        </span>
        <span styleName="HowItWorksInfo">
          <FormattedMessage id="HowItWorks29" defaultMessage="If a suitable order is found and the seller confirms the exchange, you will be redirected to the exchange page" />
        </span>
      </div>
      <div styleName="HowItWorksItem">
        <span styleName="HowItWorksStep">
          <FormattedMessage id="HowItWorks34" defaultMessage="3. Make a cryptocurrency deposit." />
        </span>
        <span styleName="HowItWorksInfo">
          <FormattedMessage id="HowItWorks37" defaultMessage="In the event that the required amount is available on your internal wallet, the deposit will be executed automatically." /> {/* eslint-disable-line */}
        </span>
      </div>
      <div styleName="HowItWorksItem">
        <span styleName="HowItWorksStep">
          <FormattedMessage id="HowItWorks42" defaultMessage="4. Confirm completion of the swap." />
        </span>
        <span styleName="HowItWorksInfo">
          <FormattedMessage
            id="HowItWorks45"
            defaultMessage="The exchange usually takes about a minute.  At the end of the swap, you will see the txid and will be able to confirm completion of the transfer on your end." /> {/* eslint-disable-line */}
        </span>
      </div>
    </div>
  </div>
)

export default CSSModules(HowItWorks, styles, { allowMultiple: true })
