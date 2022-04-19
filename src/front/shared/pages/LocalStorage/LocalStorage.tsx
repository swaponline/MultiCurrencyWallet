import React, { useState, useEffect } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import CSSModules from 'react-css-modules'
import styles from './LocalStorage.scss'
import { FormattedMessage } from 'react-intl'

function LocalStorage() {
  const [isCopied, setCopied] = useState(false)
  const [localStorage, setLocalStorage] = useState(JSON.stringify({}))
  const dumpAll = true

  const timeoutCopied = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 1000) // copy-tip animation time
  }

  useEffect(() => {
    const newStorage = {}
    const privateDataRegExp = /(mnemonic|private|twentywords|backup|peeridjson)/i;

    for (let key in window.localStorage) {
      if ((key !== 'redux-store' && key.match(privateDataRegExp) === null)
        || (dumpAll && (key !== 'redux-store'))
      ) {
        newStorage[key] = window.localStorage[key]
      }
    }
    setLocalStorage(JSON.stringify(newStorage, undefined, 2))
  })

  return (
    <section styleName="localStorage">
      {!dumpAll && (
        <h3>
          <FormattedMessage
            id="localStorageUserNotification"
            defaultMessage="✔️ This data doesn't contain your private keys"
          />
        </h3>
      )}

      <div styleName='localStorage__buttons-container'>
        <button styleName='localStorage__btn' onClick={() => {
          window.history.back()
        }}>
          <FormattedMessage
            id="localStorageBtnBack"
            defaultMessage="Back"
          />
        </button>
        <CopyToClipboard text={localStorage} >
          <button styleName='localStorage__btn' onClick={timeoutCopied}>
            {isCopied && <span styleName='localStorage__copy-tip'>Copied!</span>}
            <FormattedMessage id="FeeControler49" defaultMessage="Copy" />
          </button>
        </CopyToClipboard>
      </div>

      <pre styleName='localStorage__json-output'>
        {localStorage}
      </pre>
    </section>
  )
}

export default CSSModules(LocalStorage, styles)