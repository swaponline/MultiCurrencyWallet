import React, { useState, useEffect } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import CSSModules from 'react-css-modules'
import styles from './LocalStorage.scss'
import { constants } from 'helpers'
import { isMobile } from 'react-device-detect'
import { FormattedMessage } from 'react-intl'


const isDark = localStorage.getItem(constants.localStorage.isDark)

function LocalStorage() {
  const [isCopied, setIsCopied] = useState(false)
  const [localStorage, setLocalStorage] = useState(JSON.stringify({}))

  const changeCopiedState = () => {
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 500)
  }

  const sendToDevelopers = () => {
    // https://noxon.wpmix.net/counter.php?todev=1&msg=post
  }

  useEffect(() => {
    const newStorage = {}
    const privateKeyRegExp = /(mnemonic|private)/i;

    for (let key in window.localStorage) {
      if (key !== 'redux-store' && key.match(privateKeyRegExp) === null) {
        newStorage[key] = window.localStorage[key]
      }
    }

    setLocalStorage(JSON.stringify(newStorage))
  })

  return (
    <section styleName={`localStorage ${isDark ? 'dark' : ''}`}>
      <h3>
        <FormattedMessage
          id="localStorageUserNotification"
          defaultMessage="✔️ This data doesn't contain your private keys"
        />
      </h3>

      <div styleName='localStorage__btns-container'>
        <button styleName='localStorage__btn' onClick={() => {
          document.location.href = '#/exchange'
        }}>
          <FormattedMessage
            id="localStorageBtnExchange"
            defaultMessage="Exchange"
          />
        </button>
        <button styleName='localStorage__btn' onClick={changeCopiedState}>
          <CopyToClipboard text={localStorage} >
            <FormattedMessage
              id="localStorageBtnSend"
              defaultMessage="Copy"
            />
          </CopyToClipboard>
        </button>
        <button styleName='localStorage__btn' onClick={sendToDevelopers}>
            <FormattedMessage
              id="localStorageBtnSend"
              defaultMessage="Send to developers"
            />
        </button>
      </div>


      <textarea styleName='localStorage__textarea' value={localStorage} />
    </section>
  )
}

export default CSSModules(LocalStorage, styles)