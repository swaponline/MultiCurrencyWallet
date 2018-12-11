import React, { Fragment } from 'react'

import actions from 'redux/actions'
import { constants, links } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './SubscribeButton.scss'

import ReactTooltip from 'react-tooltip'
import { FormattedMessage } from 'react-intl'


const handleSubscribe = () => {
  const isLocalNet = process.env.LOCAL === 'local'
  const isSupportedServiceWorker = 'serviceWorker' in navigator
  const iOSSafari = /iP(ad|od|hone)/i.test(window.navigator.userAgent)
                  && /WebKit/i.test(window.navigator.userAgent)
                  && !(/(CriOS|FxiOS|OPiOS|mercury)/i.test(window.navigator.userAgent))
  const isSafari = ('safari' in window)

  if (!isLocalNet && isSupportedServiceWorker && !iOSSafari && !isSafari) {
    actions.analytics.dataEvent('subscribe')
    actions.modals.open(constants.modals.Subscribe, {})
  } else {
    const googleFormLink = 'https://goo.gl/forms/WdwcmfO3H90uZi6F2'
    window.open(googleFormLink, '_blank')
  }
}

const SubscribeButton = ({ mobile }) => (
  <div styleName={mobile ? 'mobile' : ''}>
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
          <button styleName="button" data-tut="reactour__subscribe" onClick={handleSubscribe} /* eslint-disable-line */ data-tip data-for="subscribe" >
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
    <button styleName="buttonMobile" onClick={handleSubscribe} /* eslint-disable-line */ >
      <i className="fa fa-gift" aria-hidden="true" />
    </button>
  </div>
)

export default CSSModules(SubscribeButton, styles)
