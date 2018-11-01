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
          <a href={links.main} target="_blank" rel="noreferrer noopener" styleName="button" data-tip data-for="m">
            <FormattedMessage id="AddOffer16" defaultMessage="Mainnet"/>
          </a>
          <ReactTooltip id="m" type="light" effect="solid">
            <FormattedMessage id="AddOffer22" defaultMessage="Start to real Swap">
              {message => <span>{message}</span>}
            </FormattedMessage>
          </ReactTooltip>
        </Fragment>
      ) : (
        <Fragment>
          <button styleName="button" onClick={() => pinkClick()} /* eslint-disable-line */ data-tip data-for="a" >
          Subscribe
          </button>
          <ReactTooltip id="a" type="light" effect="solid">
            <FormattedMessage id="AddOffer22" defaultMessage="Get subscribed for the Swap.Online news">
              {message => <span>{message}</span>}
            </FormattedMessage>
          </ReactTooltip>
        </Fragment>
      )
    }
    <button styleName="buttonMobile" onClick={() => pinkClick()} /* eslint-disable-line */ />
  </Fragment>
)

export default CSSModules(AddOfferButton, styles)
