import React, { Fragment } from 'react'

import actions from 'redux/actions'
import { constants, links } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './AddOfferButton.scss'

import ReactTooltip from 'react-tooltip'
import { FormattedMessage } from 'react-intl'


const handleSubscribe = () => {
  actions.analytics.dataEvent('subscribe')
  actions.modals.open(constants.modals.Subscribe, {})
}

const AddOfferButton  = () => (
  <Fragment>
    {
      process.env.LOCAL !== 'local' && (
        <Fragment>
          {
            process.env.TESTNET ? (
              <Fragment>
                <a href={links.main} target="_blank" rel="noreferrer noopener" styleName="button" data-tip data-for="main">
                  <FormattedMessage id="ADDoffer2218" defaultMessage="Mainnet" />
                </a>
                <ReactTooltip id="main" type="light" effect="solid">
                  <span>
                    <FormattedMessage id="ADDoffer22" defaultMessage="Start to real Swap" />
                  </span>
                </ReactTooltip>
              </Fragment>
            ) : (
              <Fragment>
                <button styleName="button" onClick={handleSubscribe} /* eslint-disable-line */ data-tip data-for="subscribe" >
                  <FormattedMessage id="ADDoffer29" defaultMessage="Subscribe" />
                </button>
                <ReactTooltip id="subscribe" type="light" effect="solid">
                  <span>
                    <FormattedMessage id="ADDoffer33" defaultMessage="Get subscribed for the Swap.Online news" />
                  </span>
                </ReactTooltip>
              </Fragment>
            )
          }
          <button styleName="buttonMobile" onClick={handleSubscribe} /* eslint-disable-line */ />
        </Fragment>
      )
    }
  </Fragment>
)

export default CSSModules(AddOfferButton, styles)
