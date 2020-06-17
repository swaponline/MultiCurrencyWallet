import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './Loader.scss'

import { tips } from 'helpers'
import { FormattedMessage } from 'react-intl'

import config from 'app-config'


const isFirefox = navigator.userAgent.indexOf('Firefox') !== -1
const isWidget = config && config.isWidget

const Loader = ({ overlayClassName, className, data, showTips, showMyOwnTip }) => (
  <div styleName="Firefox overlay" className={overlayClassName}>
    <div>
      <div styleName="loader" className={className}>
        <div styleName="loader1" />
        <div styleName="loader2" />
        <div styleName="loader3" />
      </div>
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
      {showTips && !isWidget && !Boolean(showMyOwnTip) && <div styleName="tips">{tips('loader')}</div>}
      {!isWidget && Boolean(showMyOwnTip) && <div styleName="tips">{showMyOwnTip}</div>}
    </div>
  </div>
)

Loader.propTypes = {
  overlayClassName: PropTypes.string,
  className: PropTypes.string,
  data: PropTypes.shape({
    txId: PropTypes.string,
  }),
  showTips: PropTypes.bool,
}

Loader.deafultProps = {
  data: null,
  showTips: false,
}

export default CSSModules(Loader, styles, { allowMultiple: true })
