import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './Loader.scss'

import { tips } from 'helpers'
import { FormattedMessage } from 'react-intl'

import config from 'app-config'

import logoPath from './images/logoAtomic.png'


const isFirefox = navigator.userAgent.indexOf('Firefox') !== -1
const isWidget = config && config.isWidget

const imgNode = React.createElement('img', {
  src: logoPath,
  alt: 'Atomicswapwallet.io logo',
})

const Loader = ({ overlayClassName, className, data, showTips }) => (
  <div styleName="Firefox overlay" className={overlayClassName}>
    <div>
      <div styleName="loader" className={className}>
        {imgNode}
      </div>
      {
        data && data.txId && (
          <p styleName="text">
            <FormattedMessage id="Loader21" defaultMessage="Please wait, it takes from 3 to 5 minutes to complete the transaction." />
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
        (showTips && !isWidget) && (
          <div styleName="tips">
            {tips('loader')}
          </div>
        )
      }
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
