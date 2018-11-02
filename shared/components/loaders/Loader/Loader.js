import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './Loader.scss'

import { tips } from 'helpers'
import { FormattedMessage } from 'react-intl'


const Loader = ({ overlayClassName, className, text, txId, showTips }) => (
  <div styleName="overlay" className={overlayClassName}>
    <div styleName="loader center" className={className}>
      <div styleName="loader1" />
      <div styleName="loader2" />
      <div styleName="loader3" />
    </div>
    {
      data && data.text && (<p styleName="text">
        <FormattedMessage id="loader19" defaultMessage="Please wait, it takes from 3 to 5 minutes to complete the transaction." />
      </p>
      )
    }
    {
      txId && (
        <a
          href={txId}
          styleName="link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {txId}
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
  text: PropTypes.bool,
  txId: PropTypes.bool,
  showTips: PropTypes.bool,
}

Loader.deafultProps = {
  text: false,
  txId: false,
  showTips: false,
}


export default CSSModules(Loader, styles, { allowMultiple: true })
