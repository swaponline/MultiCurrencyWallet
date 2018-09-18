import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Loader.scss'

import { getRandomTip } from '../../../../config/tips'


const Loader = ({ overlayClassName, className, text = false, txId, showTips = false }) => (
  <div styleName="overlay" className={overlayClassName}>
    <div styleName="loader center" className={className}>
      <div styleName="loader1" />
      <div styleName="loader2" />
      <div styleName="loader3" />
    </div>
    {
      text && <p styleName="text">Please wait, it takes from 3 to 5 minutes to complete the transaction.</p>
    }
    {
      txId && <a href={txId} styleName="link" target="_blank" rel="noopener noreferrer" >{txId}</a>
    }
    {
      !!showTips && <div style={{
        fontSize: '16px',
        position: 'absolute',
        top: '60%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
      }}>{getRandomTip('loader')}
      </div>
    }
  </div>
)


export default CSSModules(Loader, styles, { allowMultiple: true })
