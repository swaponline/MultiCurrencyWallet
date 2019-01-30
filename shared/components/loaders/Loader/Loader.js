import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './Loader.scss'

import { tips } from 'helpers'
import { FormattedMessage } from 'react-intl'

const isFirefox = navigator.userAgent.indexOf('Firefox') !== -1

const Loader = ({ overlayClassName, className, data, showTips }) => (
  <div styleName={`${isFirefox ? 'Firefox ' : ''}overlay`} className={overlayClassName}>
    <div styleName="loader center" className={className}>
      <div styleName="loader1" />
      <div styleName="loader2" />
      <div styleName="loader3" />
    </div>
    {
      data && data.txId && (
        <p styleName="text">
          <FormattedMessage id="Loader21"  defaultMessage="Please wait, it takes from 3 to 5 minutes to complete the transaction." />
        </p>
      )
    }
    {
      data && data.txId && (
        <a
          href={data.txId}
          styleName="link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {data.txId}
        </a>
      )
    }
    {
      showTips && (
        <div styleName="tips">
          {tips('loader')}
        </div>
      )
    }
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
