import React, { Fragment } from 'react'

import { constants, links } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './AddOfferButton.scss'

import ReactTooltip from 'react-tooltip'
import { FormattedMessage } from 'react-intl'


const AddOfferButton  = () => (
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
          <button styleName="button" onClick={() => pinkClick()} /* eslint-disable-line */ data-tip data-for="subscribe" >
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
    <button styleName="buttonMobile" onClick={() => pinkClick()} /* eslint-disable-line */ />
  </Fragment>
)

export default CSSModules(AddOfferButton, styles)
